-- Migration: fix Pro access for cancelled-but-in-period users
--
-- Fixes: v_is_pro required plan_status = 'active' only, which meant users who
-- cancelled but still have time remaining (plan_status = 'cancelled',
-- plan_current_period_end > now()) were routed to the credit path instead of
-- the Pro path. The frontend already shows these users the Pro pill; the SQL
-- must match.
--
-- Also adds SET search_path = public, pg_catalog to all SECURITY DEFINER
-- functions that were missing it, and re-asserts REVOKE/GRANT on all functions
-- that are replaced here.

-- ── 1. start_or_regen_resume ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.start_or_regen_resume(
  p_jd_hash      text,
  p_job_title    text,
  p_company_name text,
  p_force_fresh  boolean DEFAULT false
)
RETURNS TABLE (resume_id uuid, is_regen boolean, regen_count int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller         uuid;
  v_existing_id    uuid;
  v_existing_count int;
  v_new_id         uuid;
  v_plan_type      text;
  v_plan_status    text;
  v_period_end     timestamptz;
  v_is_pro         boolean;
  v_new_usage      int;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT plan_type, plan_status, plan_current_period_end
    INTO v_plan_type, v_plan_status, v_period_end
    FROM public.profiles
   WHERE id = v_caller;

  -- Include 'cancelled' so users who cancelled but are still within their
  -- billing period retain Pro access (period_end check enforces expiry).
  v_is_pro := (
    v_plan_type   IN ('pro_monthly', 'pro_annual')
    AND v_plan_status IN ('active', 'cancelled')
    AND (v_period_end IS NULL OR v_period_end > now())
  );

  SELECT id, r.regen_count
    INTO v_existing_id, v_existing_count
    FROM public.resumes r
   WHERE r.user_id = v_caller AND r.job_description_hash = p_jd_hash;

  IF v_is_pro THEN
    -- ── PRO PATH ────────────────────────────────────────────────────────────

    IF v_existing_id IS NOT NULL THEN
      IF p_force_fresh THEN
        -- Try plan increment first; fall back to credit at limit (atomic check)
        UPDATE public.profiles
           SET plan_monthly_usage = plan_monthly_usage + 1
         WHERE id = v_caller AND plan_monthly_usage < 100
         RETURNING plan_monthly_usage INTO v_new_usage;

        UPDATE public.resumes
           SET regen_count = 0, last_generated_at = now()
         WHERE id = v_existing_id;

        IF v_new_usage IS NULL THEN
          -- At monthly limit: spend a credit (raises P0001 if none)
          PERFORM public.spend_credit(v_existing_id);
        END IF;

        RETURN QUERY SELECT v_existing_id, false, 0;
        RETURN;
      END IF;

      -- Regen: always free for Pro (limit 5)
      IF v_existing_count >= 5 THEN
        RAISE EXCEPTION 'regen limit reached' USING ERRCODE = 'P0002';
      END IF;

      UPDATE public.resumes
         SET regen_count = v_existing_count + 1, last_generated_at = now()
       WHERE id = v_existing_id;

      RETURN QUERY SELECT v_existing_id, true, v_existing_count + 1;
      RETURN;
    END IF;

    -- Pro new JD: try plan increment first; fall back to credit at limit
    UPDATE public.profiles
       SET plan_monthly_usage = plan_monthly_usage + 1
     WHERE id = v_caller AND plan_monthly_usage < 100
     RETURNING plan_monthly_usage INTO v_new_usage;

    INSERT INTO public.resumes (user_id, job_description_hash, job_title, company_name)
    VALUES (v_caller, p_jd_hash, p_job_title, p_company_name)
    RETURNING id INTO v_new_id;

    IF v_new_usage IS NULL THEN
      PERFORM public.spend_credit(v_new_id);
    END IF;

    RETURN QUERY SELECT v_new_id, false, 0;

  ELSE
    -- ── CREDIT PATH ──────────────────────────────────────────────────────────

    IF v_existing_id IS NOT NULL THEN
      IF p_force_fresh THEN
        UPDATE public.resumes
           SET regen_count = 0, last_generated_at = now()
         WHERE id = v_existing_id;
        PERFORM public.spend_credit(v_existing_id);
        RETURN QUERY SELECT v_existing_id, false, 0;
        RETURN;
      END IF;

      IF v_existing_count >= 5 THEN
        RAISE EXCEPTION 'regen limit reached' USING ERRCODE = 'P0002';
      END IF;

      UPDATE public.resumes
         SET regen_count = v_existing_count + 1, last_generated_at = now()
       WHERE id = v_existing_id;

      RETURN QUERY SELECT v_existing_id, true, v_existing_count + 1;
      RETURN;
    END IF;

    INSERT INTO public.resumes (user_id, job_description_hash, job_title, company_name)
    VALUES (v_caller, p_jd_hash, p_job_title, p_company_name)
    RETURNING id INTO v_new_id;

    PERFORM public.spend_credit(v_new_id);

    RETURN QUERY SELECT v_new_id, false, 0;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.start_or_regen_resume(text, text, text, boolean) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.start_or_regen_resume(text, text, text, boolean) TO authenticated;

-- ── 2. restore_credit ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.restore_credit(p_resume_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller      uuid;
  v_plan_type   text;
  v_plan_status text;
  v_period_end  timestamptz;
  v_is_pro      boolean;
  v_credit_id   uuid;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT plan_type, plan_status, plan_current_period_end
    INTO v_plan_type, v_plan_status, v_period_end
    FROM public.profiles
   WHERE id = v_caller;

  -- Match the same v_is_pro definition as start_or_regen_resume.
  v_is_pro := (
    v_plan_type   IN ('pro_monthly', 'pro_annual')
    AND v_plan_status IN ('active', 'cancelled')
    AND (v_period_end IS NULL OR v_period_end > now())
  );

  IF v_is_pro THEN
    -- Check for a fallback credit spent within the 5-min undo window
    UPDATE public.credits
       SET spent_at = null, spent_on_resume_id = null
     WHERE spent_on_resume_id = p_resume_id
       AND user_id = v_caller
       AND spent_at > now() - INTERVAL '5 minutes'
     RETURNING id INTO v_credit_id;

    IF v_credit_id IS NOT NULL THEN
      -- Fallback path: restore credit balance
      UPDATE public.profiles
         SET credits_remaining = credits_remaining + 1
       WHERE id = v_caller;
    ELSE
      -- Normal plan path: decrement monthly_usage if within window
      IF EXISTS (
        SELECT 1 FROM public.resumes
         WHERE id      = p_resume_id
           AND user_id = v_caller
           AND last_generated_at > now() - INTERVAL '5 minutes'
      ) THEN
        UPDATE public.profiles
           SET plan_monthly_usage = GREATEST(0, plan_monthly_usage - 1)
         WHERE id = v_caller;
      END IF;
    END IF;
  ELSE
    -- Credit path: un-spend the credit within the 5-min window
    UPDATE public.credits
       SET spent_at = null, spent_on_resume_id = null
     WHERE spent_on_resume_id = p_resume_id
       AND user_id = v_caller
       AND spent_at > now() - INTERVAL '5 minutes';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.restore_credit(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.restore_credit(uuid) TO authenticated;

-- ── 3. Add SET search_path to activate_subscription and cancel_subscription ───
-- These were missing SET search_path in their original migration.

CREATE OR REPLACE FUNCTION public.activate_subscription(
  p_user_id    uuid,
  p_plan_type  text,
  p_period_end timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF p_plan_type NOT IN ('pro_monthly', 'pro_annual') THEN
    RAISE EXCEPTION 'invalid plan type: %', p_plan_type;
  END IF;

  UPDATE public.profiles
  SET plan_type               = p_plan_type,
      plan_status             = 'active',
      plan_current_period_end = p_period_end,
      plan_usage_reset_at     = now(),
      plan_monthly_usage      = 0
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_subscription(uuid, text, timestamptz) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.activate_subscription(uuid, text, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_subscription(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.profiles
  SET plan_status = 'cancelled'
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_subscription(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cancel_subscription(uuid) TO authenticated;
