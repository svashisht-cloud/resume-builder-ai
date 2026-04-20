import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const VALID_PRODUCTS = ["resume_pack", "resume_pack_plus"] as const;
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
        { error: "Invalid product. Must be 'resume_pack' or 'resume_pack_plus'." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: paymentId, error } = await supabase.rpc("mock_purchase_credits", {
      p_product: product,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, payment_id: paymentId });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
