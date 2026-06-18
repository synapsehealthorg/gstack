"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string; // 'buyer' or 'manufacturer'
  
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }
  
  // Note: Since we have an RLS insert trigger (if we wanted one), or we can just 
  // rely on the user manually inserting their profile if we didn't add a trigger.
  // In the current schema, there is no trigger to auto-create the profile. We should create it here.
  
  if (data.user) {
    // Generate unique default username
    const baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "user";
    const defaultUsername = `${baseUsername}-${data.user.id.substring(0, 4)}`;

    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      user_type: role,
      username: defaultUsername,
    });
    
    if (profileError) {
      console.error("Profile creation error:", profileError);
    }
    
    if (role === 'manufacturer') {
      await supabase.from('manufacturer_profiles').insert({
        id: data.user.id,
        company_name: fullName + " Company", // Placeholder
      });
    } else if (role === 'buyer') {
      await supabase.from('buyer_profiles').insert({
        id: data.user.id,
      });
    }
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
