-- Migration: increase regeneration limit from 2 to 5 per resume
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
    IF v_existing_id IS NOT NULL THEN
      IF p_force_fresh THEN
        UPDATE public.profiles
           SET plan_monthly_usage = plan_monthly_usage + 1
         WHERE id = v_caller AND plan_monthly_usage < 100
         RETURNING plan_monthly_usage INTO v_new_usage;

        UPDATE public.resumes
           SET regen_count = 0, last_generated_at = now()
         WHERE id = v_existing_id;

        IF v_new_usage IS NULL THEN
          PERFORM public.spend_credit(v_existing_id);
        END IF;

        RETURN QUERY SELECT v_existing_id, false, 0;
        RETURN;
      END IF;

      -- Regen limit raised to 5
      IF v_existing_count >= 5 THEN
        RAISE EXCEPTION 'regen limit reached' USING ERRCODE = 'P0002';
      END IF;

      UPDATE public.resumes
         SET regen_count = v_existing_count + 1, last_generated_at = now()
       WHERE id = v_existing_id;

      RETURN QUERY SELECT v_existing_id, true, v_existing_count + 1;
      RETURN;
    END IF;

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
    -- Credit path
    IF v_existing_id IS NOT NULL THEN
      IF p_force_fresh THEN
        UPDATE public.resumes
           SET regen_count = 0, last_generated_at = now()
         WHERE id = v_existing_id;
        PERFORM public.spend_credit(v_existing_id);
        RETURN QUERY SELECT v_existing_id, false, 0;
        RETURN;
      END IF;

      -- Regen limit raised to 5
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
