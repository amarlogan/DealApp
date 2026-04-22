"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        // We MUST preserve the hash so Supabase can see the tokens on the next page
        window.location.replace("/reset-password" + hash);
      }
    };

    // Check on mount
    handleHash();

    // Also check on hash changes
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [router]);

  return null;
}
