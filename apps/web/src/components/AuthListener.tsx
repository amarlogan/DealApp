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

      console.log("AuthWatcher: Checking...", { path: url.pathname, hash: !!hash, code: !!code });

      // Handle Hash (Implicit Flow) - Check for recovery in the fragment
      if (hash.includes("type=recovery") || hash.includes("recovery")) {
        console.log("AuthWatcher: Recovery hash detected! Redirecting...");
        window.location.replace("/reset-password" + hash);
        return;
      }

      // Handle Code (PKCE Flow)
      // Removed to prevent PKCE verifier missing errors across sessions.
      // Handled manually on reset-password page.
    };

    handleAuth();

    // Also check on hash changes
    window.addEventListener("hashchange", handleAuth);
    return () => window.removeEventListener("hashchange", handleAuth);
  }, [router, sb.auth]);

  return null;
}
