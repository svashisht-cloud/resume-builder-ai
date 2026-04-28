-- RPC: sync_subscription
-- Updates plan type, status, period end, and Dodo IDs without resetting
-- plan_monthly_usage or plan_usage_reset_at.
-- Used for subscription.updated and subscription.plan_changed webhook events,
-- which can fire for any field change (payment method, metadata, plan edits)
-- and must not grant a fresh monthly quota mid-cycle.
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

  UPDATE public.profiles
  SET plan_type               = p_plan_type,
      plan_status             = 'active',
      plan_current_period_end = p_period_end,
      dodo_subscription_id    = p_dodo_subscription_id,
      dodo_customer_id        = p_dodo_customer_id
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_subscription(uuid, text, timestamptz, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.sync_subscription(uuid, text, timestamptz, text, text) TO service_role;
