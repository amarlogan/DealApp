import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdmin();

    // 1. Verify Admin Session
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
    const { action, id, data } = body;

    // 2. Action Routing
    if (action === "update-section") {
      const { error } = await supabaseAdmin
        .from("landing_sections")
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "reorder") {
      const { items } = data; // Array of { id, sort_order }
      const { error } = await supabaseAdmin
        .from("landing_sections")
        .upsert(items.map((item: any) => ({
            ...item,
            updated_at: new Date().toISOString()
        })));
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "add-section") {
      const { error } = await supabaseAdmin
        .from("landing_sections")
        .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete-section") {
      const { error } = await supabaseAdmin
        .from("landing_sections")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (err: any) {
    console.error("Admin Homepage API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
