import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { dealId } = await req.json();

    if (!dealId) {
      return NextResponse.json({ error: "Missing dealId" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    
    // Call the RPC function to increment view count atomically
    const { error } = await supabase.rpc('increment_deal_view', { 
      target_deal_id: dealId 
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("View API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
