import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * GUARD RAILS: Helper to validate deal data
 */
function validateDeal(data: any) {
  const errors: string[] = [];

  if (!data.title || data.title.length < 5) errors.push("Title must be at least 5 characters.");
  if (!data.merchant) errors.push("Merchant is required.");
  if (!data.external_url || !data.external_url.startsWith('http')) errors.push("Valid Merchant URL is required.");
  
  // Pricing Guard Rails
  const current = parseFloat(data.current_price);
  const original = parseFloat(data.original_price);

  if (isNaN(current) || current < 0) errors.push("Current price must be a non-negative number.");
  if (isNaN(original) || original <= 0) errors.push("Original price must be greater than zero.");
  
  if (current > original) {
    errors.push("GUARD RAIL: Current price cannot be higher than the original price.");
  }

  return { isValid: errors.length === 0, errors };
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdmin();

    // 1. Verify Admin Session via Server Client (has cookies)
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 }); 
    }

    const body = await req.json();
    const { action, dealId, data } = body;
    const { season_ids, ...dealFields } = data;

    // 2. Route by Action (using Admin client for data ops)
    if (action === "create") {
      const validation = validateDeal(dealFields);
      if (!validation.isValid) {
        return NextResponse.json({ error: "Validation Failed", details: validation.errors }, { status: 400 });
      }

      const { data: created, error } = await supabaseAdmin
        .from("deals")
        .insert([{
          ...dealFields,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Sync Seasons
      if (season_ids && season_ids.length > 0) {
        const bridgeData = season_ids.map((sid: string) => ({ deal_id: created.id, season_id: sid }));
        await supabaseAdmin.from("deal_seasons").insert(bridgeData);
      }

      return NextResponse.json({ success: true, deal: created });
    }

    if (action === "update") {
      const validation = validateDeal(dealFields);
      if (!validation.isValid) {
        return NextResponse.json({ error: "Validation Failed", details: validation.errors }, { status: 400 });
      }

      const { data: updated, error } = await supabaseAdmin
        .from("deals")
        .update({
          ...dealFields,
          updated_at: new Date().toISOString()
        })
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;

      // Sync Seasons (Delete + Insert for simplicity)
      await supabaseAdmin.from("deal_seasons").delete().eq("deal_id", dealId);
      if (season_ids && season_ids.length > 0) {
        const bridgeData = season_ids.map((sid: string) => ({ deal_id: dealId, season_id: sid }));
        await supabaseAdmin.from("deal_seasons").insert(bridgeData);
      }

      return NextResponse.json({ success: true, deal: updated });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin.from("deals").delete().eq("id", dealId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (err: any) {
    console.error("Admin API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
