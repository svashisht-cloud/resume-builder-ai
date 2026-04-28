-- Replace purchase_credits with an idempotent version.
-- ON CONFLICT (dodo_payment_id) DO NOTHING means a Dodo webhook retry after a
-- successful first delivery no longer throws a unique constraint error.
-- When a duplicate is detected the function returns early without re-inserting credits.
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
  )
  ON CONFLICT (dodo_payment_id) DO NOTHING
  RETURNING id INTO payment_id;

  -- Duplicate delivery: payment row already exists, credits already granted
  IF payment_id IS NULL THEN
    SELECT id INTO payment_id
      FROM public.payments
     WHERE dodo_payment_id = p_dodo_payment_id;
    RETURN payment_id;
  END IF;

  FOR i IN 1..credits_count LOOP
    INSERT INTO public.credits (user_id, source, payment_id, expires_at)
    VALUES (v_user_id, p_product, payment_id, now() + INTERVAL '12 months');
  END LOOP;

  RETURN payment_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purchase_credits(text, text, text, int, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.purchase_credits(text, text, text, int, text) TO service_role;
