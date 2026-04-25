import { createClient } from "@/lib/supabase-client";

const supabase = createClient();

export type AnalyticsEvent = 'page_view' | 'deal_click' | 'get_deal_click' | 'search' | 'login' | 'signup';

export async function trackEvent(
  eventType: AnalyticsEvent, 
  data: {
    dealId?: string;
    categoryId?: string;
    path?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  try {
    // Get current session/user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Log to Supabase
    await supabase.from('site_analytics').insert({
      user_id: user?.id || null,
      event_type: eventType,
      path: data.path || window.location.pathname,
      deal_id: data.dealId,
      category_id: data.categoryId,
      metadata: data.metadata || {},
      user_agent: navigator.userAgent
    });
  } catch (err) {
    console.warn("[Analytics] Failed to track event:", err);
  }
}

/**
 * Ensures an anonymous session exists.
 * Should be called on app mount if no user is logged in.
 */
export async function ensureAnonymousSession() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Note: This requires "Anonymous Sign-ins" to be enabled in Supabase Dashboard
    const { error } = await supabase.auth.signInAnonymously();
    if (error) console.error("[Analytics] Anonymous sign-in failed:", error.message);
  }
}
