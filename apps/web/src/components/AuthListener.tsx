"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthListener() {
  const router = useRouter();
  const sb = createClient();

  useEffect(() => {
    const handleAuth = async () => {
      const url = new URL(window.location.href);
      const hash = window.location.hash;
      const code = url.searchParams.get("code");

      // Handle Hash (Implicit Flow)
      if (hash.includes("type=recovery")) {
        window.location.replace("/reset-password" + hash);
        return;
      }

      // Handle Code (PKCE Flow)
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (!error) {
          router.push("/reset-password");
        }
      }
    };

    handleAuth();

    // Also check on hash changes
    window.addEventListener("hashchange", handleAuth);
    return () => window.removeEventListener("hashchange", handleAuth);
  }, [router, sb.auth]);

  return null;
}
