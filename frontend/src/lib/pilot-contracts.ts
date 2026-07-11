export type AppRole = "buyer" | "manufacturer" | "admin"

export interface AppSession {
  userId: string
  email: string
  role: AppRole
  displayName: string
  onboardingComplete: boolean
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string }

export type OrderLifecycleState =
  | "confirmed"
  | "sampling"
  | "in_production"
  | "quality_check"
  | "shipped"
  | "delivered"
  | "completed"
  | "disputed"

export type OrderLifecycleAction =
  | "start_production"
  | "approve_sample"
  | "submit_qc"
  | "approve_qc"
  | "request_qc_changes"
  | "mark_shipped"
  | "mark_delivered"
  | "confirm_delivery"
  | "file_dispute"

export type EscrowEntryType =
  | "manual_funding"
  | "milestone_release"
  | "refund"
  | "adjustment"
