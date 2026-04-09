import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// POST /api/favorites  — body: { dealId, action: 'add' | 'remove' }
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealId, action } = await req.json();
  if (!dealId || !action) {
    return NextResponse.json({ error: "Missing dealId or action" }, { status: 400 });
  }

  if (action === "add") {
    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: user.id, deal_id: dealId }, { onConflict: "user_id,deal_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, action: "added" });
  }

  if (action === "remove") {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("deal_id", dealId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, action: "removed" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// GET /api/favorites — returns all favorited deal IDs for signed-in user
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ favorites: [] });

  const { data } = await supabase
    .from("favorites")
    .select("deal_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ favorites: data ?? [] });
}
