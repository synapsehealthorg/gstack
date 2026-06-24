import { createClient } from "@/utils/supabase/server"

export type AdminDisputeDecision = "resolved_buyer" | "resolved_manufacturer" | "closed" | "request_evidence"

export async function applyAdminDisputeDecision(id: string, decision: AdminDisputeDecision, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 401, error: "Authentication required" }
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
  if (profile?.user_type !== "admin") return { status: 403, error: "Administrator access required" }
  if (!notes.trim()) return { status: 400, error: "Decision reasoning is required" }

  const { data: dispute } = await supabase.from("disputes").select("id, order_id, status, admin_notes").eq("id", id).maybeSingle()
  if (!dispute) return { status: 404, error: "Dispute not found" }
  if (!["open", "under_review"].includes(dispute.status) && decision !== "request_evidence") return { status: 409, error: "This dispute is already resolved" }

  const status = decision === "request_evidence" ? "under_review" : decision
  const update = { status, admin_notes: [dispute.admin_notes, notes].filter(Boolean).join("\n\n"), resolved_by: decision === "request_evidence" ? null : user.id, resolved_at: decision === "request_evidence" ? null : new Date().toISOString() }
  const { error: disputeError } = await supabase.from("disputes").update(update).eq("id", id)
  if (disputeError) return { status: 500, error: disputeError.message }

  if (decision === "resolved_buyer" || decision === "resolved_manufacturer") {
    const escrowStatus = decision === "resolved_buyer" ? "refunded" : "completed"
    const { error: orderError } = await supabase.from("orders").update({ escrow_status: escrowStatus }).eq("id", dispute.order_id)
    if (orderError) return { status: 500, error: `Dispute updated, but escrow state failed: ${orderError.message}` }
  }

  await supabase.from("messages").insert({ order_id: dispute.order_id, sender_id: user.id, content: decision === "request_evidence" ? `Administrator requested more dispute evidence: ${notes}` : `Dispute decision: ${decision.replace(/_/g, " ")}. ${notes}`, message_type: "system", event_type: "dispute_decision", metadata: { dispute_id: id, decision } })
  const { error: auditError } = await supabase.from("admin_actions").insert({ admin_id: user.id, action_type: decision === "request_evidence" ? "request_dispute_evidence" : "resolve_dispute", target_type: "dispute", target_id: id, notes, metadata: { decision, order_id: dispute.order_id } })
  if (auditError) return { status: 500, error: `Decision saved, but audit logging failed: ${auditError.message}` }
  return { status: 200, data: { id, status } }
}
