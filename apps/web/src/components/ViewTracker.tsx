"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ViewTracker({ dealId }: { dealId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Increment view count on mount
    fetch("/api/deals/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId }),
    })
    .then(res => {
      if (res.ok) {
        // Refresh the page data so the UI reflects the new count
        router.refresh();
      }
    })
    .catch(err => console.error("Failed to track view:", err));
  }, [dealId, router]);

  return null;
}
