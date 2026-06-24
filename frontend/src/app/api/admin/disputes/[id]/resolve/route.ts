import { NextRequest, NextResponse } from "next/server"
import { applyAdminDisputeDecision, AdminDisputeDecision } from "@/lib/server/admin-disputes"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const form = await request.formData()
  const decision = String(form.get("decision") || "") as AdminDisputeDecision
  if (!["resolved_buyer", "resolved_manufacturer", "closed"].includes(decision)) return new NextResponse("Invalid decision", { status: 400 })
  const notes = String(form.get("notes") || `Decision recorded from arbitration workspace: ${decision.replace(/_/g, " ")}.`)
  const result = await applyAdminDisputeDecision(id, decision, notes)
  if (result.error) return new NextResponse(result.error, { status: result.status })
  return NextResponse.redirect(new URL(`/admin/disputes/${id}`, request.url), 303)
}
