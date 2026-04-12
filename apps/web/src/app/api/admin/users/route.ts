import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase-server";

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

    console.log(`[Admin API] Requester: ${user.email}, Role: ${profile?.role}`);

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access only. Your current role is: " + (profile?.role || 'null') }, { status: 403 }); 
    }

    const body = await req.json();
    const { targetUserId, newRole } = body;

    // 2. Validate Input
    if (!targetUserId || !['admin', 'user'].includes(newRole)) {
      return NextResponse.json({ error: "Invalid request payload: targetUserId and newRole ('admin' or 'user') are required." }, { status: 400 });
    }

    // 3. GUARD RAIL: Prevent self-demotion
    if (targetUserId === user.id && newRole !== 'admin') {
      return NextResponse.json({ 
        error: "GUARD RAIL: You cannot demote your own account. This prevents permanent administrative lock-out." 
      }, { status: 400 });
    }

    // 4. Update Role (using Admin client for high-privilege op)
    console.log(`[Admin API] Executing update for ${targetUserId} to ${newRole}`);
    
    const { data: updated, error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
        console.error("[Admin API] Update failed:", error);
        throw error;
    }
    
    console.log(`[Admin API] Update successful:`, updated);
    
    return NextResponse.json({ 
        success: true, 
        message: `User role successfully set to ${newRole}`,
        profile: updated 
    });

  } catch (err: any) {
    console.error("[Admin API] Top-level error:", err);
    return NextResponse.json({ 
        error: err.message || "An unexpected error occurred in the user management system." 
    }, { status: 500 });
  }
}
