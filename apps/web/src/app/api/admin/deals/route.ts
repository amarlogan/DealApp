import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

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
    const supabase = createSupabaseAdmin();

    // 1. Verify Admin Session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 0 }); 
    }

    const body = await req.json();
    const { action, dealId, data } = body;

    // 2. Route by Action
    if (action === "update") {
      const validation = validateDeal(data);
      if (!validation.isValid) {
        return NextResponse.json({ error: "Validation Failed", details: validation.errors }, { status: 400 });
      }

      const { data: updated, error } = await supabase
        .from("deals")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, deal: updated });
    }

    if (action === "delete") {
      const { error } = await supabase.from("deals").delete().eq("id", dealId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (err: any) {
    console.error("Admin API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
