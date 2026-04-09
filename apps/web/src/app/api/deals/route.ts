import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const q        = searchParams.get("q") ?? undefined;
  const sort     = searchParams.get("sort") ?? "discount_percentage";
  const minDisc  = parseInt(searchParams.get("min_discount") ?? "0");
  const page     = parseInt(searchParams.get("page") ?? "1");
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);
  const from     = (page - 1) * limit;

  try {
    const supabase = createSupabaseAdmin();
    let query = supabase
      .from("deals")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .eq("in_stock", true)
      .gte("discount_percentage", minDisc)
      .range(from, from + limit - 1);

    if (category) query = query.eq("category_id", category);
    if (q)        query = query.ilike("title", `%${q}%`);

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

    return NextResponse.json({ deals: data ?? [], total: count ?? 0, page, limit });
  } catch (err) {
    // Fallback to local JSON if Supabase not connected
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const res  = await fetch(`${base}/data/deals.json`);
      if (res.ok) {
        let deals = await res.json();
        if (category) deals = deals.filter((d: any) => d.category === category || d.category_id === category);
        if (q)        deals = deals.filter((d: any) => d.title.toLowerCase().includes(q.toLowerCase()));
        return NextResponse.json({ deals, total: deals.length, page: 1, limit: deals.length, fallback: true });
      }
    } catch {}
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 });
  }
}
