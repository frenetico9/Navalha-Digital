
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

const HARDCODED_SUPABASE_URL = 'https://yxuyycpoykfjrijbrxny.supabase.co';
const HARDCODED_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dXl5Y3BveWtmanJpamJyeG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTA5MTYsImV4cCI6MjA2NjUyNjkxNn0.O3xP-pLZ_grVRRC7R-O7dVTvaAA5jZPrumQxmH8wtT0';

console.log('[SupabaseClient] Attempting to load Supabase credentials...');

// Attempt 1: Load from import.meta.env (Vite's default for client-side)
if (typeof import.meta.env !== 'undefined') {
    console.log('[SupabaseClient] import.meta.env is available.');
    const urlFromImportMeta = import.meta.env.VITE_SUPABASE_URL;
    const keyFromImportMeta = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (urlFromImportMeta) {
        supabaseUrl = urlFromImportMeta;
        console.log('[SupabaseClient] Loaded VITE_SUPABASE_URL from import.meta.env.');
    }
    if (keyFromImportMeta) {
        supabaseAnonKey = keyFromImportMeta;
        console.log('[SupabaseClient] Loaded VITE_SUPABASE_ANON_KEY from import.meta.env.');
    }
    if (!urlFromImportMeta) console.log('[SupabaseClient] VITE_SUPABASE_URL not found in import.meta.env.');
    if (!keyFromImportMeta) console.log('[SupabaseClient] VITE_SUPABASE_ANON_KEY not found in import.meta.env.');
} else {
    console.warn('[SupabaseClient] import.meta.env is NOT available. This is common if not running in a Vite-processed environment.');
}

// Attempt 2: Load from process.env as a fallback if not fully loaded
if ((!supabaseUrl || !supabaseAnonKey) && typeof process !== 'undefined' && process.env) {
    console.log('[SupabaseClient] Attempting to load/fill from process.env.');
    const urlFromProcess = process.env.VITE_SUPABASE_URL;
    const keyFromProcess = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl && urlFromProcess) {
        supabaseUrl = urlFromProcess;
        console.log('[SupabaseClient] Loaded VITE_SUPABASE_URL from process.env.');
    } else if (!supabaseUrl) {
        console.log('[SupabaseClient] VITE_SUPABASE_URL not found in process.env.');
    }

    if (!supabaseAnonKey && keyFromProcess) {
        supabaseAnonKey = keyFromProcess;
        console.log('[SupabaseClient] Loaded VITE_SUPABASE_ANON_KEY from process.env.');
    } else if (!supabaseAnonKey) {
        console.log('[SupabaseClient] VITE_SUPABASE_ANON_KEY not found in process.env.');
    }
} else if (!supabaseUrl || !supabaseAnonKey) {
     console.warn('[SupabaseClient] process.env is NOT available or not checked because keys already found/not needed as fallback.');
}

// Attempt 3: Use hardcoded values as a last resort (NOT RECOMMENDED FOR PRODUCTION)
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '[SupabaseClient] CRITICAL: Supabase URL/Key not found in import.meta.env or process.env. ' +
        'Using HARDCODED values as a fallback. This is NOT recommended for production environments. ' +
        'Please ensure your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are correctly configured (e.g., in a .env file for Vite projects).'
    );
    if (!supabaseUrl) {
        supabaseUrl = HARDCODED_SUPABASE_URL;
        console.log('[SupabaseClient] Using hardcoded VITE_SUPABASE_URL.');
    }
    if (!supabaseAnonKey) {
        supabaseAnonKey = HARDCODED_SUPABASE_ANON_KEY;
        console.log('[SupabaseClient] Using hardcoded VITE_SUPABASE_ANON_KEY.');
    }
}


// Final check and client creation
if (!supabaseUrl || !supabaseAnonKey) {
  // This error should ideally not be reached if hardcoding is successful and values are correct
  let errorMessage = 'Supabase initialization FAILED: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are definitively missing even after all fallbacks. ';
  errorMessage += `URL Found: ${!!supabaseUrl}, Key Found: ${!!supabaseAnonKey}. `;
  errorMessage += 'This indicates a severe configuration issue or that even hardcoded values were not correctly applied/provided. ';
  errorMessage += 'Please verify your `.env` file, build process, and if necessary, the hardcoded fallback values in `supabaseClient.ts`.';
  console.error(errorMessage);
  throw new Error(errorMessage);
}

console.log(`[SupabaseClient] Initializing Supabase with URL: ${supabaseUrl}`);
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
console.log('[SupabaseClient] Supabase client initialized.');
