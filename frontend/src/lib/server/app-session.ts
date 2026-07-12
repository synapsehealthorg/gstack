import "server-only"

import type { AppRole, AppSession } from "@/lib/pilot-contracts"

export const MOCK_APP_SESSION: AppSession = {
  userId: "mock-admin",
  email: "design@proov.local",
  role: "admin" satisfies AppRole,
  displayName: "Design Mode",
  onboardingComplete: true,
}

export async function getOptionalAppSession(): Promise<AppSession | null> {
  return MOCK_APP_SESSION
}

export async function requireAppSession(): Promise<AppSession> {
  return MOCK_APP_SESSION
}

export async function requireAdminSession(): Promise<AppSession> {
  return MOCK_APP_SESSION
}
