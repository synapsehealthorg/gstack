"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const role = formData.get("role") as string;
  const fullName = String(formData.get("full_name") || "").trim();
  if (!fullName || !["buyer", "manufacturer"].includes(role)) {
    throw new Error("A valid name and role are required.");
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const { error } = await supabase.rpc("complete_pilot_onboarding", {
    selected_role: role,
    selected_full_name: fullName,
  });
  if (error) throw new Error(`Could not complete onboarding: ${error.message}`);
  
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
