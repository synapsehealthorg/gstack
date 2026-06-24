import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const allowedStatuses = new Set(["active", "under_review", "cancelled"])

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
  if (profile?.user_type !== "admin") return NextResponse.json({ error: "Administrator access required" }, { status: 403 })

  const body = await request.json().catch(() => null) as { status?: string; reason?: string } | null
  if (!body?.status || !allowedStatuses.has(body.status)) return NextResponse.json({ error: "Invalid moderation status" }, { status: 400 })
  if (!body.reason?.trim()) return NextResponse.json({ error: "A moderation reason is required" }, { status: 400 })

  const { data: inquiry, error: updateError } = await supabase.from("inquiries").update({ status: body.status }).eq("id", id).select("id, inquiry_number, title").maybeSingle()
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  if (!inquiry) return NextResponse.json({ error: "RFQ not found" }, { status: 404 })

  const { error: auditError } = await supabase.from("admin_actions").insert({ admin_id: user.id, action_type: `marketplace_${body.status}`, target_type: "inquiry", target_id: inquiry.id, notes: body.reason, metadata: { inquiry_number: inquiry.inquiry_number, title: inquiry.title } })
  if (auditError) return NextResponse.json({ error: `RFQ updated, but audit logging failed: ${auditError.message}` }, { status: 500 })

  return NextResponse.json({ data: inquiry })
}
