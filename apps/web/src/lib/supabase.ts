import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Singleton for non-SSR usage
let _client: ReturnType<typeof createClient> | null = null;

export const supabase = () => {
  if (!_client) _client = createClient();
  return _client;
};
