import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CREDIT_PRODUCTS = ["resume_pack", "resume_pack_plus"] as const;
const PRO_PRODUCTS = ["pro_monthly", "pro_annual"] as const;
const VALID_PRODUCTS = [...CREDIT_PRODUCTS, ...PRO_PRODUCTS] as const;
type CreditProduct = (typeof CREDIT_PRODUCTS)[number];
type Product = (typeof VALID_PRODUCTS)[number];

export async function POST(request: Request) {
  const mockEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_MOCK_PAYMENTS === "true";

  if (!mockEnabled) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json() as { product?: unknown };
    const product = body.product;

    if (!VALID_PRODUCTS.includes(product as Product)) {
      return Response.json(
        { error: "Invalid product." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    if (CREDIT_PRODUCTS.includes(product as CreditProduct)) {
      const { data: paymentId, error } = await supabase.rpc("mock_purchase_credits", {
        p_product: product,
      });
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ success: true, payment_id: paymentId });
    }

    // Pro subscription — does NOT insert into the payments table
    // (payments table has a CHECK constraint limiting product to credit values)
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = product === "pro_monthly" ? 30 : 365;
    const periodEnd = new Date(Date.now() + days * msPerDay).toISOString();

    const { error: subError } = await supabase.rpc("activate_subscription", {
      p_user_id: user.id,
      p_plan_type: product,
      p_period_end: periodEnd,
    });

    if (subError) {
      return Response.json({ error: subError.message }, { status: 500 });
    }

    return Response.json({ success: true, plan: product });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
