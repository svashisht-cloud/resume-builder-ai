-- Add dodo_subscription_id to profiles
-- (dodo_customer_id already exists from initial schema migration)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT;

-- Expand payments CHECK constraint to allow subscription products
-- PostgreSQL auto-named the inline CHECK as payments_product_check
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_product_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_product_check
    CHECK (product IN ('resume_pack', 'resume_pack_plus', 'pro_monthly', 'pro_annual'));

-- RPC: purchase_credits
-- Real version for webhook handler (no auth.uid() guard).
-- Looks up user by dodo_customer_id and creates payment + credit rows.
CREATE OR REPLACE FUNCTION public.purchase_credits(
  p_product          text,
  p_dodo_payment_id  text,
  p_dodo_customer_id text,
  p_amount_cents     int,
  p_currency         text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id     uuid;
  credits_count int;
  payment_id    uuid;
  i             int;
BEGIN
  SELECT id INTO v_user_id
    FROM public.profiles
   WHERE dodo_customer_id = p_dodo_customer_id
   LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'no user found for dodo_customer_id: %', p_dodo_customer_id;
  END IF;

  IF p_product = 'resume_pack' THEN
    credits_count := 3;
  ELSIF p_product = 'resume_pack_plus' THEN
    credits_count := 10;
  ELSE
    RAISE EXCEPTION 'invalid product for purchase_credits: %', p_product;
  END IF;

  INSERT INTO public.payments (
    user_id, dodo_payment_id, dodo_customer_id, product,
    amount_cents, currency, credits_granted
  ) VALUES (
    v_user_id, p_dodo_payment_id, p_dodo_customer_id, p_product,
    p_amount_cents, p_currency, credits_count
  ) RETURNING id INTO payment_id;

  FOR i IN 1..credits_count LOOP
    INSERT INTO public.credits (user_id, source, payment_id, expires_at)
    VALUES (v_user_id, p_product, payment_id, now() + INTERVAL '12 months');
  END LOOP;

  RETURN payment_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purchase_credits(text, text, text, int, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.purchase_credits(text, text, text, int, text) TO service_role;

-- RPC: activate_subscription_webhook
-- Like activate_subscription but no auth.uid() guard; also stores Dodo IDs.
-- Keep original activate_subscription — mock route calls it.
CREATE OR REPLACE FUNCTION public.activate_subscription_webhook(
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
      plan_usage_reset_at     = now(),
      plan_monthly_usage      = 0,
      dodo_subscription_id    = p_dodo_subscription_id,
      dodo_customer_id        = p_dodo_customer_id
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_subscription_webhook(uuid, text, timestamptz, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.activate_subscription_webhook(uuid, text, timestamptz, text, text) TO service_role;

-- RPC: renew_subscription
-- Updates period end and resets monthly usage on each billing cycle.
CREATE OR REPLACE FUNCTION public.renew_subscription(
  p_user_id        uuid,
  p_new_period_end timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.profiles
  SET plan_status             = 'active',
      plan_current_period_end = p_new_period_end,
      plan_monthly_usage      = 0,
      plan_usage_reset_at     = now()
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.renew_subscription(uuid, timestamptz) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.renew_subscription(uuid, timestamptz) TO service_role;

-- RPC: cancel_subscription_webhook
-- Like cancel_subscription but no auth.uid() guard.
-- Keep original cancel_subscription — mock route calls it.
CREATE OR REPLACE FUNCTION public.cancel_subscription_webhook(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.profiles
  SET plan_status = 'cancelled'
  WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_subscription_webhook(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cancel_subscription_webhook(uuid) TO service_role;

-- RPC: record_subscription_payment
-- Inserts subscription invoice rows into payments. ON CONFLICT DO NOTHING for idempotency.
CREATE OR REPLACE FUNCTION public.record_subscription_payment(
  p_user_id          uuid,
  p_dodo_payment_id  text,
  p_dodo_customer_id text,
  p_product          text,
  p_amount_cents     int,
  p_currency         text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.payments (
    user_id, dodo_payment_id, dodo_customer_id, product,
    amount_cents, currency, credits_granted
  ) VALUES (
    p_user_id, p_dodo_payment_id, p_dodo_customer_id, p_product,
    p_amount_cents, p_currency, 0
  )
  ON CONFLICT (dodo_payment_id) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_subscription_payment(uuid, text, text, text, int, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.record_subscription_payment(uuid, text, text, text, int, text) TO service_role;
