import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Missing env vars — log a warning and use placeholder values so the app
  // can still render in dev/learning mode. Real auth/data calls will fail,
  // but the UI itself stays visible.
  console.warn(
    "[bliss] Supabase env vars not set. Using placeholder client — UI will render but data calls will fail. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env to enable the backend."
  )
}

const FALLBACK_URL = "https://placeholder.supabase.co"
const FALLBACK_KEY = "placeholder-anon-key"

export const supabase = createClient<Database>(
  SUPABASE_URL || FALLBACK_URL,
  SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);