import { NextRequest, NextResponse } from "next/server"
import { applyAdminDisputeDecision } from "@/lib/server/admin-disputes"

type Decision = "resolved_buyer" | "resolved_manufacturer" | "closed" | "request_evidence"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null) as { decision?: Decision; notes?: string } | null
  if (!body?.decision || !["resolved_buyer", "resolved_manufacturer", "closed", "request_evidence"].includes(body.decision)) return NextResponse.json({ error: "Invalid dispute decision" }, { status: 400 })
  const result = await applyAdminDisputeDecision(id, body.decision, body.notes || "")
  return result.error ? NextResponse.json({ error: result.error }, { status: result.status }) : NextResponse.json({ data: result.data })
}
