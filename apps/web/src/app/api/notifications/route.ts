import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// GET /api/notifications
// Fetch recent notifications for the current user
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// PATCH /api/notifications
// Mark a notification as read or mark all as read
// body: { notificationId?: string, markAll?: boolean }
export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notificationId, markAll } = await req.json();

  let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);

  if (markAll) {
    // Already set to filter by user_id
  } else if (notificationId) {
    query = query.eq("id", notificationId);
  } else {
    return NextResponse.json({ error: "Missing notificationId or markAll" }, { status: 400 });
  }

  const { error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
