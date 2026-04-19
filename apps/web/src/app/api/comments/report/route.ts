import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId, reason } = await req.json();

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    // 2. Insert report
    // The unique constraint (user_id, comment_id) in DB will handle double-reporting
    const { error } = await supabase
      .from("comment_reports")
      .insert({
        comment_id: commentId,
        user_id: user.id,
        reason: reason || "General report"
      });

    if (error) {
      // Handle the case where the user already reported this comment
      if (error.code === '23505') {
        return NextResponse.json({ message: "You have already reported this comment" });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: "Comment reported successfully" });
  } catch (err: any) {
    console.error("Report Comment Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
