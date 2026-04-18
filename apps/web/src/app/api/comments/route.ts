import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dealId = searchParams.get("dealId");

  if (!dealId) {
    return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch comments with profiles
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq("deal_id", dealId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch Comments Error:", error);
      throw error;
    }

    return NextResponse.json({ comments: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId, content, parentId } = await req.json();

    if (!dealId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert the comment
    const { data, error } = await supabase
      .from("comments")
      .insert({
        deal_id: dealId,
        user_id: user.id,
        content: content,
        parent_id: parentId || null,
      })
      .select(`
        *,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .maybeSingle(); 

    if (error) {
      console.error("Post Comment Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Failed to create comment record" }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  } catch (err: any) {
    console.error("Comment API Critical Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
