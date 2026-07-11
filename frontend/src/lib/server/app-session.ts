import "server-only"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import type { AppRole, AppSession } from "@/lib/pilot-contracts"

function validRole(value: unknown): value is AppRole {
  return value === "buyer" || value === "manufacturer" || value === "admin"
}

export async function getOptionalAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const isDevBypass = process.env.NODE_ENV !== "production" && cookieStore.get("dev_bypass")?.value === "true"

  if (isDevBypass) {
    return {
      userId: "00000000-0000-0000-0000-000000000000",
      email: "dev@proov.to",
      role: "admin", // Admin role avoids restrictive queries that fail with empty UUID
      displayName: "Dev Bypass",
      onboardingComplete: true,
    }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, user_type")
    .eq("id", user.id)
    .maybeSingle()

  const role = validRole(profile?.user_type) ? profile.user_type : "buyer"
  return {
    userId: user.id,
    email: user.email || "",
    role,
    displayName: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Member",
    onboardingComplete: Boolean(profile && validRole(profile.user_type) && profile.full_name),
  }
}

export async function requireAppSession(): Promise<AppSession> {
  const session = await getOptionalAppSession()
  if (!session) redirect("/login")
  if (!session.onboardingComplete) redirect("/onboarding")
  return session
}

export async function requireAdminSession(): Promise<AppSession> {
  const session = await requireAppSession()
  if (session.role !== "admin") redirect("/dashboard")
  return session
}
