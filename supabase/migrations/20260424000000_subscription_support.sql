-- Migration: subscription support
-- Adds Pro plan columns to profiles, new subscription RPCs,
-- rewrites start_or_regen_resume (Pro path + P0003 removed),
-- and makes restore_credit Pro-aware.

-- ── 1. Add columns to profiles (idempotent) ──────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'plan_type'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN plan_type               text NOT NULL DEFAULT 'free'
        CHECK (plan_type IN ('free', 'pro_monthly', 'pro_annual')),
      ADD COLUMN plan_status             text NOT NULL DEFAULT 'inactive'
        CHECK (plan_status IN ('active', 'inactive', 'cancelled', 'past_due')),
      ADD COLUMN plan_current_period_end timestamptz,
      ADD COLUMN plan_monthly_usage      int  NOT NULL DEFAULT 0,
      ADD COLUMN plan_usage_reset_at     timestamptz;
  END IF;
END $$;

-- ── 2. reset_monthly_usage ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reset_monthly_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.profiles
  SET plan_monthly_usage = 0,
      plan_usage_reset_at = now()
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reset_monthly_usage(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.reset_monthly_usage(uuid) TO service_role;

-- ── 3. activate_subscription ──────────────────────────────────────────────────
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

-- ── 4. cancel_subscription ────────────────────────────────────────────────────
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

  -- Sets cancelled status; plan_type and plan_current_period_end are unchanged
  -- so the user retains Pro access until the period end.
  UPDATE public.profiles
  SET plan_status = 'cancelled'
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_subscription(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cancel_subscription(uuid) TO authenticated;

-- ── 5. start_or_regen_resume (complete replacement) ───────────────────────────
-- Pro path: no credit spend; fair-use cap 100/month (P0004).
-- Credit path: P0003 removed — free credits now allow regeneration.
CREATE OR REPLACE FUNCTION public.start_or_regen_resume(
  p_jd_hash      text,
  p_job_title    text,
  p_company_name text,
  p_force_fresh  boolean DEFAULT false
)
RETURNS TABLE (resume_id uuid, is_regen boolean, regen_count int)
LANGUAGE plpgsql
SECURITY DEFINER
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

  v_is_pro := (
    v_plan_type IN ('pro_monthly', 'pro_annual')
    AND v_plan_status = 'active'
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
        -- Atomic fair-use increment with cap check (eliminates race condition)
        UPDATE public.profiles
           SET plan_monthly_usage = plan_monthly_usage + 1
         WHERE id = v_caller AND plan_monthly_usage < 100
         RETURNING plan_monthly_usage INTO v_new_usage;

        IF v_new_usage IS NULL THEN
          RAISE EXCEPTION 'fair use limit reached' USING ERRCODE = 'P0004';
        END IF;

        UPDATE public.resumes
           SET regen_count = 0, last_generated_at = now()
         WHERE id = v_existing_id;

        RETURN QUERY SELECT v_existing_id, false, 0;
        RETURN;
      END IF;

      -- Pro regen: P0002 only (P0003 does not apply to Pro)
      IF v_existing_count >= 2 THEN
        RAISE EXCEPTION 'regen limit reached' USING ERRCODE = 'P0002';
      END IF;

      UPDATE public.resumes
         SET regen_count = v_existing_count + 1, last_generated_at = now()
       WHERE id = v_existing_id;

      RETURN QUERY SELECT v_existing_id, true, v_existing_count + 1;
      RETURN;
    END IF;

    -- Pro new JD: atomic fair-use increment then insert
    UPDATE public.profiles
       SET plan_monthly_usage = plan_monthly_usage + 1
     WHERE id = v_caller AND plan_monthly_usage < 100
     RETURNING plan_monthly_usage INTO v_new_usage;

    IF v_new_usage IS NULL THEN
      RAISE EXCEPTION 'fair use limit reached' USING ERRCODE = 'P0004';
    END IF;

    INSERT INTO public.resumes (user_id, job_description_hash, job_title, company_name)
    VALUES (v_caller, p_jd_hash, p_job_title, p_company_name)
    RETURNING id INTO v_new_id;

    RETURN QUERY SELECT v_new_id, false, 0;

  ELSE
    -- ── CREDIT PATH (P0003 removed — free credits now allow regen) ──────────

    IF v_existing_id IS NOT NULL THEN
      IF p_force_fresh THEN
        UPDATE public.resumes
           SET regen_count = 0, last_generated_at = now()
         WHERE id = v_existing_id;
        PERFORM public.spend_credit(v_existing_id);
        RETURN QUERY SELECT v_existing_id, false, 0;
        RETURN;
      END IF;

      -- Regen: P0002 only (P0003 removed)
      IF v_existing_count >= 2 THEN
        RAISE EXCEPTION 'regen limit reached' USING ERRCODE = 'P0002';
      END IF;

      UPDATE public.resumes
         SET regen_count = v_existing_count + 1, last_generated_at = now()
       WHERE id = v_existing_id;

      RETURN QUERY SELECT v_existing_id, true, v_existing_count + 1;
      RETURN;
    END IF;

    -- New JD: insert + spend credit (atomic rollback if P0001)
    INSERT INTO public.resumes (user_id, job_description_hash, job_title, company_name)
    VALUES (v_caller, p_jd_hash, p_job_title, p_company_name)
    RETURNING id INTO v_new_id;

    PERFORM public.spend_credit(v_new_id);

    RETURN QUERY SELECT v_new_id, false, 0;
  END IF;
END;
$$;

-- ── 6. restore_credit (Pro-aware replacement) ─────────────────────────────────
-- Pro users: decrement plan_monthly_usage within the 5-min window.
-- Credit users: un-spend credit within the 5-min window (unchanged).
CREATE OR REPLACE FUNCTION public.restore_credit(p_resume_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller        uuid;
  v_plan_type     text;
  v_plan_status   text;
  v_period_end    timestamptz;
  v_is_pro        boolean;
  v_within_window boolean;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT plan_type, plan_status, plan_current_period_end
    INTO v_plan_type, v_plan_status, v_period_end
    FROM public.profiles
   WHERE id = v_caller;

  v_is_pro := (
    v_plan_type IN ('pro_monthly', 'pro_annual')
    AND v_plan_status = 'active'
    AND (v_period_end IS NULL OR v_period_end > now())
  );

  IF v_is_pro THEN
    -- Use last_generated_at for the window (no credits.spent_at in Pro path)
    SELECT EXISTS (
      SELECT 1 FROM public.resumes
       WHERE id       = p_resume_id
         AND user_id  = v_caller
         AND last_generated_at > now() - INTERVAL '5 minutes'
    ) INTO v_within_window;

    IF v_within_window THEN
      UPDATE public.profiles
         SET plan_monthly_usage = GREATEST(0, plan_monthly_usage - 1)
       WHERE id = v_caller;
    END IF;
  ELSE
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
