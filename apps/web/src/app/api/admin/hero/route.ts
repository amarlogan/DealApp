import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";

// Admin API for Hero Banner Management
export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdmin();

    // 1. Authorization
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

    const { action, id, data, items } = await req.json();

    // 2. Routing Actions
    switch (action) {
      case "create": {
        const { error } = await supabaseAdmin.from("hero_slides").insert([data]);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Slide created" });
      }

      case "update": {
        const { error } = await supabaseAdmin.from("hero_slides").update(data).eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Slide updated" });
      }

      case "delete": {
        const { error } = await supabaseAdmin.from("hero_slides").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Slide deleted" });
      }

      case "reorder": {
          // Bulk update sort orders
          const { error } = await supabaseAdmin.from("hero_slides").upsert(
              items.map((item: any) => ({
                  id: item.id,
                  sort_order: item.sort_order,
                  updated_at: new Date().toISOString()
              }))
          );
          if (error) throw error;
          return NextResponse.json({ success: true, message: "Sequence updated" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (err: any) {
    console.error("Hero Admin API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
