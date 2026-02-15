import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Guard: if env vars are missing, create a no-op client that won't crash the app
const url = SUPABASE_URL || "https://placeholder.supabase.co";
const key = SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(url, key);

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
