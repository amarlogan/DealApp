"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        router.push("/reset-password");
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
