"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent, ensureAnonymousSession } from "@/lib/analytics";

export default function AnalyticsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Ensure we have at least an anonymous session for tracking
    ensureAnonymousSession();
  }, []);

  useEffect(() => {
    // 2. Track page view on every route change
    trackEvent('page_view', {
      path: pathname,
      metadata: {
        search: searchParams.toString()
      }
    });
  }, [pathname, searchParams]);

  return null;
}
