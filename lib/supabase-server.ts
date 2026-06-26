import "server-only"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
  console.error("Missing required environment variables:")
  if (!supabaseUrl) console.error("  - NEXT_PUBLIC_SUPABASE_URL")
  if (!supabaseAnonKey) console.error("  - NEXT_PUBLIC_SUPABASE_ANON_KEY")
  if (!supabaseServiceRole) console.error("  - SUPABASE_SERVICE_ROLE_KEY")
  throw new Error("Missing required Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

export function handleSupabaseError(error: {
  message?: string
  code?: string
  details?: string
  hint?: string
}) {
  console.error("Supabase error:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  })
  throw new Error(error.message || "An error occurred with the database")
}
