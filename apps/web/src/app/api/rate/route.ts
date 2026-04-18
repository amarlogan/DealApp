import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// GET: Fetch user's rating and global distribution for a deal
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get("dealId");

    if (!dealId) {
      return NextResponse.json({ error: "Missing dealId" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Get user's rating if logged in
    let userRating = null;
    if (user) {
      const { data } = await supabase
        .from("deal_ratings")
        .select("rating")
        .eq("deal_id", dealId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) userRating = data.rating;
    }

    // 2. Get distribution (how many 5s, 4s, etc)
    const { data: distributionData } = await supabase
      .from("deal_ratings")
      .select("rating");
    
    // In a real app with 1M+ rows, you'd use a RPC or specialized view
    // For now, we'll calculate since it's a demo
    const distribution = [0, 0, 0, 0, 0, 0]; // index 1-5
    (distributionData || []).forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
    });

    return NextResponse.json({ 
      userRating: userRating, // 1 (Down), 5 (Up)
      distribution: [0, 0, 0, 0, 0] // Deprecated for votes
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Submit or update a rating
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId, rating } = await req.json(); // rating: 1 (Down), 5 (Up)

    if (!dealId || !rating || (rating !== 1 && rating !== 5)) {
      return NextResponse.json({ error: "Invalid vote data. Use 1 for Down or 5 for Up." }, { status: 400 });
    }

    // Upsert the rating
    const { error } = await supabase
      .from("deal_ratings")
      .upsert({
        deal_id: dealId,
        user_id: user.id,
        rating: rating,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "deal_id,user_id"
      });

    if (error) throw error;

    // Fetch the NEW aggregate from the deals table (synced by trigger)
    const { data: updatedDeal } = await supabase
      .from("deals")
      .select("upvotes, downvotes, view_count")
      .eq("id", dealId)
      .single();

    return NextResponse.json({ 
      success: true,
      upvotes: updatedDeal?.upvotes || 0,
      downvotes: updatedDeal?.downvotes || 0,
      score: (updatedDeal?.upvotes || 0) - (updatedDeal?.downvotes || 0),
      viewCount: updatedDeal?.view_count || 0
    });
  } catch (err: any) {
    console.error("Rate API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
