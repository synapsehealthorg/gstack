import { NextRequest, NextResponse } from "next/server"
import { applyAdminDisputeDecision } from "@/lib/server/admin-disputes"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const form = await request.formData()
  const notes = String(form.get("notes") || "Provide additional dated evidence and supporting production records.")
  const result = await applyAdminDisputeDecision(id, "request_evidence", notes)
  if (result.error) return new NextResponse(result.error, { status: result.status })
  return NextResponse.redirect(new URL(`/admin/disputes/${id}`, request.url), 303)
}
