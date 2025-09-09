// lib/db.ts
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client using environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Provide a stub getPool function to satisfy existing imports. This will throw an error if called.
export function getPool() {
  throw new Error('getPool is not implemented. Use the Supabase client instead.');
}
