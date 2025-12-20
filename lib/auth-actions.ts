"use server";

import { createClient } from "utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // In een echte app zou je hier een betere foutmelding tonen
    console.error("Login error:", error.message);
    return redirect("/login?message=Kon gebruiker niet authenticeren");
  }

  return redirect("/");
}

export async function signup(formData: FormData) {
  const origin = headers().get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // URL waar de gebruiker naartoe wordt gestuurd na het klikken op de bevestigingslink in de e-mail
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    return redirect("/signup?message=Kon gebruiker niet authenticeren");
  }

  // Toon een bericht dat de gebruiker zijn e-mail moet controleren
  return redirect("/login?message=Controleer je e-mail om door te gaan met aanmelden");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}
