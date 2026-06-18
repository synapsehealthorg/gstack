"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const role = formData.get("role") as string;
  const fullName = formData.get("full_name") as string;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "user";
  const defaultUsername = `${baseUsername}-${user.id.substring(0, 4)}`;

  await supabase.from('profiles').insert({
    id: user.id,
    email: user.email,
    full_name: fullName,
    user_type: role,
    username: defaultUsername,
  });
  
  if (role === 'manufacturer') {
    await supabase.from('manufacturer_profiles').insert({
      id: user.id,
      company_name: fullName + " Company",
    });
  } else if (role === 'buyer') {
    await supabase.from('buyer_profiles').insert({
      id: user.id,
    });
  }
  
  revalidatePath("/", "layout");
  redirect("/");
}
