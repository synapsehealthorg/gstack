import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

type ManufacturerAction = "verify" | "hold" | "suspend" | "restore" | "toggle_premium"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  const { data: admin } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
  if (admin?.user_type !== "admin") return NextResponse.json({ error: "Administrator access required" }, { status: 403 })

  const body = await request.json().catch(() => null) as { action?: ManufacturerAction; notes?: string } | null
  if (!body?.action || !["verify", "hold", "suspend", "restore", "toggle_premium"].includes(body.action)) return NextResponse.json({ error: "Invalid manufacturer action" }, { status: 400 })
  if (!body.notes?.trim()) return NextResponse.json({ error: "Review reasoning is required" }, { status: 400 })

  const { data: profile } = await supabase.from("profiles").select("id, is_premium, account_status").eq("id", id).maybeSingle()
  if (!profile) return NextResponse.json({ error: "Manufacturer not found" }, { status: 404 })

  if (body.action === "verify" || body.action === "hold") {
    const { error } = await supabase.from("manufacturer_profiles").update({ verified: body.action === "verify", verified_at: body.action === "verify" ? new Date().toISOString() : null }).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const accountStatus = body.action === "suspend" ? "suspended" : body.action === "hold" ? "under_review" : ["verify", "restore"].includes(body.action) ? "active" : profile.account_status
  const profilePatch = body.action === "toggle_premium" ? { is_premium: !profile.is_premium } : { account_status: accountStatus }
  const { error: profileError } = await supabase.from("profiles").update(profilePatch).eq("id", id)
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  const { error: auditError } = await supabase.from("admin_actions").insert({ admin_id: user.id, action_type: `manufacturer_${body.action}`, target_type: "manufacturer", target_id: id, notes: body.notes, metadata: { prior_account_status: profile.account_status, prior_premium: profile.is_premium } })
  if (auditError) return NextResponse.json({ error: `Account updated, but audit logging failed: ${auditError.message}` }, { status: 500 })
  return NextResponse.json({ data: { id, action: body.action } })
}
