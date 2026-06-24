import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Authentication required", { status: 401 })
  const { data: admin } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
  if (admin?.user_type !== "admin") return new NextResponse("Administrator access required", { status: 403 })
  const { error } = await supabase.from("manufacturer_profiles").update({ verified: false, verified_at: null }).eq("id", id)
  if (error) return new NextResponse(error.message, { status: 500 })
  const { error: profileError } = await supabase.from("profiles").update({ account_status: "under_review" }).eq("id", id)
  if (profileError) return new NextResponse(profileError.message, { status: 500 })
  const { error: auditError } = await supabase.from("admin_actions").insert({ admin_id: user.id, action_type: "manufacturer_hold", target_type: "manufacturer", target_id: id, notes: "Application placed on review hold from manufacturer detail." })
  if (auditError) return new NextResponse(`Manufacturer placed on hold, but the audit record failed: ${auditError.message}`, { status: 500 })
  return NextResponse.redirect(new URL(`/admin/manufacturers/${id}`, request.url), 303)
}
