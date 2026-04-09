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

  return NextResponse.redirect(new URL(next, url.origin));
}
