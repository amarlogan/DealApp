import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const season   = searchParams.get("season") ?? undefined;
  const featured = searchParams.get("featured") === "true";
  const q        = searchParams.get("q") ?? undefined;
  const tag      = searchParams.get("tag") ?? undefined;
  const sort     = searchParams.get("sort") ?? "discount_percentage";
  const minDisc  = parseInt(searchParams.get("min_discount") ?? "0");
  const page     = parseInt(searchParams.get("page") ?? "1");
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);
  const from     = (page - 1) * limit;

  try {
    const supabase = createSupabaseAdmin();
    
    // Base selector
    let selectString = "*";
    if (season) {
      // Use inner join on deal_seasons to filter results by season
      selectString = "*, deal_seasons!inner(season_id)";
    }

    let query = supabase
      .from("deals")
      .select(selectString, { count: "exact" })
      .eq("status", "active")
      .eq("in_stock", true)
      .gte("discount_percentage", minDisc);

    if (category) query = query.eq("category_id", category);
    
    if (tag) {
      if (tag === "Flash Deal") {
        query = query.gte("discount_percentage", 40).is("badge", null);
      } else {
        query = query.eq("badge", tag);
      }
    }
    
    if (season) {
      query = query.eq("deal_seasons.season_id", season);
    }
    
    if (featured) {
      query = query.or(`is_popular.eq.true,discount_percentage.gte.30`);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,merchant.ilike.%${q}%,category_id.ilike.%${q}%`);
    }

    // Pagination
    query = query.range(from, from + limit - 1);

    // Sort options
    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      discount_percentage: { column: "discount_percentage", ascending: false },
      price_asc:           { column: "current_price",       ascending: true },
      price_desc:          { column: "current_price",       ascending: false },
      newest:              { column: "created_at",          ascending: false },
      rating:              { column: "rating",              ascending: false },
    };
    const s = sortMap[sort] ?? sortMap.discount_percentage;
    query = query.order(s.column, { ascending: s.ascending });

    const { data, error, count } = await query;
    if (error) throw error;

    const enrichedDeals = (data ?? []).map((deal: any) => {
      const score = (deal.upvotes || 0) - (deal.downvotes || 0);
      const views = deal.view_count || 0;
      
      // Calculate is_hot: 
      // 1. If meets vote threshold (Score >= 10)
      // 2. OR high discount (25%+)
      // 3. OR high view count (100+)
      // 4. OR manual popular flag
      const isActuallyHot = score >= 10;
      const isHighDiscount = deal.discount_percentage >= 25;
      const isHighViews = deal.view_count >= 100;
      const isManualPopular = deal.is_popular;
      
      return {
        ...deal,
        score,
        is_hot: isActuallyHot || isHighDiscount || isHighViews || isManualPopular
      };
    });

    return NextResponse.json({ deals: enrichedDeals, total: count ?? 0, page, limit });
  } catch (err) {
    // Fallback to local JSON if Supabase not connected
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const res  = await fetch(`${base}/data/deals.json`);
      if (res.ok) {
        let deals = await res.json();
        if (category) deals = deals.filter((d: any) => d.category === category || d.category_id === category);
        if (featured) deals = deals.filter((d: any) => d.is_popular || (d.discount_percentage >= 30));
        // Note: season filtering isn't easily simulated in offline JSON without bridge data
        if (q) {
          const lowerQ = q.toLowerCase();
          deals = deals.filter((d: any) => 
            (d.title && d.title.toLowerCase().includes(lowerQ)) ||
            (d.merchant && d.merchant.toLowerCase().includes(lowerQ)) ||
            (d.category_id && d.category_id.toLowerCase().includes(lowerQ)) ||
            (d.category && d.category.toLowerCase().includes(lowerQ))
          );
        }
        return NextResponse.json({ deals, total: deals.length, page: 1, limit: deals.length, fallback: true });
      }
    } catch {}
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 });
  }
}
