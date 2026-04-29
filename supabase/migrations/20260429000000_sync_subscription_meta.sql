-- RPC: sync_subscription_meta
-- Updates period end and Dodo IDs without touching plan_type or resetting usage.
-- Used for subscription.updated webhook events, which fire for any field change
-- (payment method, metadata, scheduled plan changes, etc.) and must not flip
-- plan_type before a deferred plan change has actually activated.
CREATE OR REPLACE FUNCTION public.sync_subscription_meta(
  p_user_id              uuid,
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
  UPDATE public.profiles
  SET plan_current_period_end = p_period_end,
      dodo_subscription_id    = p_dodo_subscription_id,
      dodo_customer_id        = p_dodo_customer_id
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_subscription_meta(uuid, timestamptz, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.sync_subscription_meta(uuid, timestamptz, text, text) TO service_role;
