import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // 1. Verify admin permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Update manufacturer profile
  const { error: updateError } = await supabase
    .from("manufacturer_profiles")
    .update({ verified: true })
    .eq("id", params.id);

  if (updateError) {
    return new NextResponse(updateError.message, { status: 500 });
  }

  // 3. Log the action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "verify_manufacturer",
    target_type: "manufacturer",
    target_id: params.id,
    notes: "Verified manufacturer application",
  });

  // 4. Send email (placeholder for Resend logic)
  // await sendEmail({ to: manufacturerEmail, subject: "You're verified!" })

  // 5. Redirect back to review page
  return NextResponse.redirect(new URL(`/admin/manufacturers/${params.id}`, request.url));
}
