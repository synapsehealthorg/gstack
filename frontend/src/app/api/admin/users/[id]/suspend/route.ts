import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Authentication required", { status: 401 })
  const { data: admin } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
  if (admin?.user_type !== "admin") return new NextResponse("Administrator access required", { status: 403 })
  const { data: target } = await supabase.from("profiles").select("account_status").eq("id", id).maybeSingle()
  if (!target) return new NextResponse("User not found", { status: 404 })
  const nextStatus = target.account_status === "suspended" ? "active" : "suspended"
  const { error } = await supabase.from("profiles").update({ account_status: nextStatus }).eq("id", id)
  if (error) return new NextResponse(error.message, { status: 500 })
  const { error: auditError } = await supabase.from("admin_actions").insert({ admin_id: user.id, action_type: nextStatus === "suspended" ? "suspend_user" : "restore_user", target_type: "profile", target_id: id, notes: `Account status set to ${nextStatus}` })
  if (auditError) return new NextResponse(`Account status changed, but the audit record failed: ${auditError.message}`, { status: 500 })
  return NextResponse.redirect(new URL(`/admin/manufacturers/${id}`, request.url), 303)
}
