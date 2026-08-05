"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import { loginSchema, registerSchema } from "@/lib/validations";

export async function signIn(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Username atau password tidak valid." };
  }

  const supabase = await createClient();

  const identifier = parsed.data.email.includes("@")
    ? parsed.data.email
    : `${parsed.data.email}@simsurat.internal`;

  const { error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Username atau password salah.",
    };
  }

  await recordAudit("Login");
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await recordAudit("Logout");
  await supabase.auth.signOut();
  redirect("/login");
}

export async function registerUser(input: unknown): Promise<{
  success: boolean;
  error?: string;
  data?: unknown;
}> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Data pengguna tidak valid." };
  }

  const supabase = await createClient();

  const { data: created, error } = await supabase.rpc("admin_create_user", {
    p_email: parsed.data.email,
    p_password: parsed.data.password,
    p_full_name: parsed.data.full_name,
    p_role: parsed.data.role,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: created };
}

export async function updateUser(
  userId: string,
  input: { full_name: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_user", {
    p_user_id: userId,
    p_full_name: input.full_name,
    p_role: input.role,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_user", {
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
