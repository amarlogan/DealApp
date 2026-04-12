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

    if (action === "create") {
      // Basic validation
      if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      if (!data.start_date || !data.end_date) return NextResponse.json({ error: "Date range is required" }, { status: 400 });

      const { data: created, error } = await supabaseAdmin
        .from("seasons")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, season: created });
    }

    if (action === "update") {
      const { data: updated, error } = await supabaseAdmin
        .from("seasons")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, season: updated });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin.from("seasons").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (err: any) {
    console.error("Admin Seasons API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
