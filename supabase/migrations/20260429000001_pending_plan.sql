-- Add pending plan columns so a deferred monthly→annual switch can be tracked
-- without flipping plan_type before the billing date arrives.
ALTER TABLE public.profiles
  ADD COLUMN pending_plan_type text
    CHECK (pending_plan_type IN ('pro_monthly', 'pro_annual')),
  ADD COLUMN pending_plan_date timestamptz;

-- Replace sync_subscription to:
--   1. Clear pending fields once the plan actually activates.
--   2. Skip the update when pending_plan_date is still in the future
--      (guards against Dodo firing subscription.plan_changed at scheduling
--      time rather than only at activation time).
CREATE OR REPLACE FUNCTION public.sync_subscription(
  p_user_id              uuid,
  p_plan_type            text,
  p_period_end           timestamptz,
  p_dodo_subscription_id text,
  p_dodo_customer_id     text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF p_plan_type NOT IN ('pro_monthly', 'pro_annual') THEN
    RAISE EXCEPTION 'invalid plan type: %', p_plan_type;
  END IF;

  -- Only apply when there is no pending change scheduled for the future.
  -- If pending_plan_date is set and still in the future this is a premature
  -- webhook; skip silently so the DB does not flip ahead of billing.
  UPDATE public.profiles
  SET plan_type               = p_plan_type,
      plan_status             = 'active',
      plan_current_period_end = p_period_end,
      dodo_subscription_id    = p_dodo_subscription_id,
      dodo_customer_id        = p_dodo_customer_id,
      pending_plan_type       = NULL,
      pending_plan_date       = NULL
  WHERE id = p_user_id
    AND (pending_plan_date IS NULL OR pending_plan_date <= NOW());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_subscription(uuid, text, timestamptz, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.sync_subscription(uuid, text, timestamptz, text, text) TO service_role;
