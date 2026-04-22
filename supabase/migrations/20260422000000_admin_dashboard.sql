-- Admin dashboard migration

-- 1. Admin columns on profiles
ALTER TABLE profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN disabled_at timestamptz;

-- 2. Pipeline run telemetry table
CREATE TABLE pipeline_runs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users NOT NULL,
  resume_id           uuid REFERENCES resumes,
  is_regen            boolean NOT NULL DEFAULT false,
  step1_duration_ms   int,
  step2_duration_ms   int,
  step3_duration_ms   int,
  total_duration_ms   int,
  score_before        int,
  score_after         int,
  score_delta         int,
  tokens_eval1        int,
  tokens_tailor       int,
  tokens_eval2        int,
  estimated_cost_usd  numeric(8,5),
  error_step          text,
  error_code          text,
  created_at          timestamptz DEFAULT now()
);
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
-- No RLS policies: zero client access, service role only

-- 3. Admin grant credits RPC
CREATE OR REPLACE FUNCTION admin_grant_credits(
  p_user_id uuid,
  p_count int,
  p_reason text DEFAULT 'admin_grant'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO credits (user_id, source, granted_at, expires_at)
  SELECT p_user_id, p_reason, now(), now() + interval '12 months'
  FROM generate_series(1, p_count);
END;
$$;

-- 4. Disable user RPC
CREATE OR REPLACE FUNCTION disable_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE profiles SET disabled_at = now() WHERE id = p_user_id;
END;
$$;
