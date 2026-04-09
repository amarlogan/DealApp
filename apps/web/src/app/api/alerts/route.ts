import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// POST /api/alerts  — body: { dealId, targetPrice }
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, targetPrice } = await req.json();
  if (!dealId) return NextResponse.json({ error: "Missing dealId" }, { status: 400 });

  const { data, error } = await supabase
    .from("price_alerts")
    .upsert(
      { user_id: user.id, deal_id: dealId, target_price: targetPrice ?? null, is_active: true },
      { onConflict: "user_id,deal_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, alert: data });
}

// DELETE /api/alerts?alertId=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alertId = req.nextUrl.searchParams.get("alertId");
  if (!alertId) return NextResponse.json({ error: "Missing alertId" }, { status: 400 });

  const { error } = await supabase
    .from("price_alerts")
    .delete()
    .eq("id", alertId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
