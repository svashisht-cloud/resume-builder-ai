import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const mockEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_MOCK_PAYMENTS === "true";

  if (!mockEnabled) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { error } = await supabase.rpc("cancel_subscription", {
    p_user_id: user.id,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
