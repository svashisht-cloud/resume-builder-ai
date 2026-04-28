-- RPC: set_subscription_status
-- Used by webhook handler for on_hold, failed, expired, and other state transitions.
-- Allowed statuses must match the profiles.plan_status CHECK constraint.
CREATE OR REPLACE FUNCTION public.set_subscription_status(
  p_user_id uuid,
  p_status  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF p_status NOT IN ('active', 'inactive', 'cancelled', 'past_due') THEN
    RAISE EXCEPTION 'invalid plan_status: %', p_status;
  END IF;

  UPDATE public.profiles
  SET plan_status = p_status
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_subscription_status(uuid, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.set_subscription_status(uuid, text) TO service_role;
