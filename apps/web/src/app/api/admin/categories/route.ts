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
    const { action, catId, data } = body;
    const { show_in_nav, show_on_home, ...categoryFields } = data;

    if (action === "create") {
      // Basic validation
      if (!categoryFields.id || categoryFields.id.length < 2) return NextResponse.json({ error: "Valid ID is required" }, { status: 400 });
      if (!categoryFields.label) return NextResponse.json({ error: "Label is required" }, { status: 400 });

      const { data: created, error } = await supabaseAdmin
        .from("categories")
        .insert([{
          ...categoryFields,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Sync Visibility
      if (show_in_nav) {
        await supabaseAdmin.from("navigation_items").upsert({
          category_id: created.id,
          sort_order: created.sort_order
        }, { onConflict: 'category_id' });
      }
      
      if (show_on_home) {
        await supabaseAdmin.from("landing_sections").upsert({
          category_id: created.id,
          title: null, // Default to category label
          sort_order: created.sort_order
        }, { onConflict: 'category_id' });
      }

      // Merge flags for return
      return NextResponse.json({ 
        success: true, 
        category: { ...created, show_in_nav, show_on_home } 
      });
    }

    if (action === "update") {
      const { data: updated, error } = await supabaseAdmin
        .from("categories")
        .update({
          ...categoryFields,
          updated_at: new Date().toISOString()
        })
        .eq("id", catId)
        .select()
        .single();

      if (error) throw error;

      // 1. Sync Navigation
      if (show_in_nav) {
        await supabaseAdmin.from("navigation_items").upsert({
          category_id: updated.id,
          sort_order: updated.sort_order
        }, { onConflict: 'category_id' });
      } else {
        await supabaseAdmin.from("navigation_items").delete().eq("category_id", catId);
      }

      // 2. Sync Landing
      if (show_on_home) {
        await supabaseAdmin.from("landing_sections").upsert({
          category_id: updated.id,
          sort_order: updated.sort_order
        }, { onConflict: 'category_id' });
      } else {
        await supabaseAdmin.from("landing_sections").delete().eq("category_id", catId);
      }

      return NextResponse.json({ 
        success: true, 
        category: { ...updated, show_in_nav, show_on_home } 
      });
    }

    if (action === "delete") {
      // GUARD RAIL: Prevent deleting 'other' fallback
      if (catId === 'other') return NextResponse.json({ error: "Cannot delete the system fallback category" }, { status: 400 });

      const { error } = await supabaseAdmin.from("categories").delete().eq("id", catId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (err: any) {
    console.error("Admin Category API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
