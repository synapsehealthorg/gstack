"use client"

import { createClient } from "@/utils/supabase/client"
import type {
  ActionResult,
  EscrowEntryType,
  OrderLifecycleAction,
} from "@/lib/pilot-contracts"

function failure<T>(code: string, error: unknown): ActionResult<T> {
  return {
    ok: false,
    code,
    message: error instanceof Error ? error.message : "The operation could not be completed.",
  }
}

export async function transitionOrder(input: {
  orderId: string
  action: OrderLifecycleAction
  notes?: string
  proofUrls?: string[]
  carrier?: string
  trackingNumber?: string
}): Promise<ActionResult<string>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("transition_order_lifecycle", {
      target_order_id: input.orderId,
      lifecycle_action: input.action,
      event_notes: input.notes || null,
      event_proof_urls: input.proofUrls || [],
      shipment_carrier: input.carrier || null,
      shipment_tracking: input.trackingNumber || null,
    })
    if (error) throw error
    return { ok: true, data: String(data) }
  } catch (error) {
    return failure("ORDER_TRANSITION_FAILED", error)
  }
}

export async function recordManualEscrow(input: {
  orderId: string
  entryType: EscrowEntryType
  amount: number
  currency: string
  reference: string
  notes?: string
}): Promise<ActionResult<string>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("record_manual_escrow", {
      target_order_id: input.orderId,
      ledger_entry_type: input.entryType,
      ledger_amount: input.amount,
      ledger_currency: input.currency,
      ledger_reference: input.reference,
      ledger_notes: input.notes || null,
    })
    if (error) throw error
    return { ok: true, data: String(data) }
  } catch (error) {
    return failure("ESCROW_RECORD_FAILED", error)
  }
}
