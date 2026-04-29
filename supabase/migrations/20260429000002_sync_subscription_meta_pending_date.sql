-- Replace sync_subscription_meta to also keep pending_plan_date in sync with
-- plan_current_period_end whenever a pending plan switch exists.
-- If Dodo reschedules the renewal window (e.g. after a payment retry pushes the
-- billing date), the UI banner will show the correct updated date rather than the
-- original stale one.
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
      dodo_customer_id        = p_dodo_customer_id,
      -- Only move pending_plan_date when a switch is actually scheduled;
      -- leave it alone (NULL or already set) when no pending plan exists.
      pending_plan_date       = CASE
                                  WHEN pending_plan_type IS NOT NULL THEN p_period_end
                                  ELSE pending_plan_date
                                END
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_subscription_meta(uuid, timestamptz, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.sync_subscription_meta(uuid, timestamptz, text, text) TO service_role;
