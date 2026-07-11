const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable ${name}. Add it to frontend/.env.local or the deployment environment.`)
  }
  return value
}

export const publicEnv = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey),
}
