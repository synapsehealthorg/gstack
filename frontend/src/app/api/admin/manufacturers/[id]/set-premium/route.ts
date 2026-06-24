import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Authentication required", { status: 401 })
  const { data: admin } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
  if (admin?.user_type !== "admin") return new NextResponse("Administrator access required", { status: 403 })
  const { data: target } = await supabase.from("profiles").select("is_premium").eq("id", id).maybeSingle()
  if (!target) return new NextResponse("Manufacturer not found", { status: 404 })
  const nextPremium = !target.is_premium
  const { error } = await supabase.from("profiles").update({ is_premium: nextPremium }).eq("id", id)
  if (error) return new NextResponse(error.message, { status: 500 })
  const { error: auditError } = await supabase.from("admin_actions").insert({ admin_id: user.id, action_type: "manufacturer_premium", target_type: "manufacturer", target_id: id, notes: nextPremium ? "Premium enabled" : "Premium removed" })
  if (auditError) return new NextResponse(`Premium status changed, but the audit record failed: ${auditError.message}`, { status: 500 })
  return NextResponse.redirect(new URL(`/admin/manufacturers/${id}`, request.url), 303)
}
