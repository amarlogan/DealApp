import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// Rate limiter (swap for Redis/Upstash in production)
const rateMap = new Map<string, { count: number; ts: number }>();
const WINDOW_MS  = 60_000;
const MAX_CLICKS = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dealId = searchParams.get("dealId");

  // ── Rate-limit by IP ──────────────────────────────────────────────────────
  const ip  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const now = Date.now();
  const e   = rateMap.get(ip) ?? { count: 0, ts: now };

  if (now - e.ts < WINDOW_MS) {
    if (e.count >= MAX_CLICKS) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    e.count++;
  } else {
    e.count = 1; e.ts = now;
  }
  rateMap.set(ip, e);

  if (!dealId) return NextResponse.redirect(new URL("/", req.url));

  // ── Resolve affiliate URL from Supabase ───────────────────────────────────
  let affiliateUrl: string | null = null;

  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from("deals")
      .select("affiliate_url, external_url")
      .eq("id", dealId)
      .single();

    // Prefer affiliate URL; fall back to direct merchant URL
    affiliateUrl = data?.affiliate_url || data?.external_url || null;

    // ── Log click ────────────────────────────────────────────────────────────
    if (data) {
      await supabase.from("deal_clicks").insert({
        deal_id:    dealId,
        ip_address: ip,
        user_agent: req.headers.get("user-agent") ?? "",
        referer:    req.headers.get("referer") ?? "",
      }).then(() => null); // fire-and-forget
    }
  } catch (err) {
    console.error("[exit] Supabase error:", err);
    // Fallback: try deals.json
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const res  = await fetch(`${base}/data/deals.json`);
      if (res.ok) {
        const deals = await res.json();
        const d = deals.find((x: any) => x.id === dealId);
        affiliateUrl = d?.affiliate_url ?? d?.external_url ?? null;
      }
    } catch {}
  }

  if (!affiliateUrl) {
    return NextResponse.redirect(new URL(`/?error=notfound`, req.url));
  }

  return NextResponse.redirect(affiliateUrl, { status: 302 });
}
