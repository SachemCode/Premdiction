// Re-export server clients for existing server-side imports.
// Client components must use lib/supabase-browser.ts or API routes instead.
export { supabase, supabaseAdmin, handleSupabaseError } from "./supabase-server"
