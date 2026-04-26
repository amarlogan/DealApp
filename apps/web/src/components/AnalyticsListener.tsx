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
    let categoryId = undefined;
    let dealId = undefined;

    if (pathname.startsWith('/category/')) {
      categoryId = pathname.split('/category/')[1]?.split('/')[0];
    } else if (pathname.startsWith('/deal/')) {
      dealId = pathname.split('/deal/')[1]?.split('/')[0];
    }

    trackEvent('page_view', {
      path: pathname,
      categoryId,
      dealId,
      metadata: {
        search: searchParams.toString()
      }
    });
  }, [pathname, searchParams]);

  return null;
}
