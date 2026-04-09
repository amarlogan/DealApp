import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple in-memory rate limiting map for demonstration. 
// In production, use Redis (e.g. Upstash) or Supabase table.
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get('dealId');
  const ip = request.headers.get('x-forwarded-for') || 'anonymous_ip';

  // Rate Limiting Logic: Max 10 clicks per IP per minute
  const now = Date.now();
  const rateData = rateLimitMap.get(ip) || { count: 0, timestamp: now };
  
  if (now - rateData.timestamp < 60000) {
    if (rateData.count >= 10) {
      return NextResponse.json({ error: "Rate limit exceeded. Please back off." }, { status: 429 });
    }
    rateData.count++;
  } else {
    rateData.count = 1;
    rateData.timestamp = now;
  }
  rateLimitMap.set(ip, rateData);

  if (!dealId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Fetch actual deal URL from DB securely to prevent open redirects
  const { data, error } = await supabase
    .from('deals')
    .select('external_url')
    .eq('id', dealId)
    .single();

  if (error || !data?.external_url) {
    console.error("Deal not found for exit redirect", error);
    return NextResponse.redirect(new URL('/?error=notfound', request.url));
  }

  // TODO: Log tracking metrics here (e.g. Supabase Edge Function or standard insert to 'clicks' table)

  return NextResponse.redirect(data.external_url);
}
