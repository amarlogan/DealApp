import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// GET /auth/callback — handles OAuth redirect from Supabase
export async function GET(req: Request) {
  const url  = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Use the public base URL for redirects to avoid internal Docker addresses (0.0.0.0)
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://huntmydeal.com";
  
  return NextResponse.redirect(new URL(next, base));
}
