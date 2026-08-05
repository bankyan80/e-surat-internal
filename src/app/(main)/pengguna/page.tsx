import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PenggunaPage } from "@/components/pengguna/pengguna-page";

export const metadata: Metadata = {
  title: "Pengguna",
};

export const dynamic = "force-dynamic";

export default async function PenggunaRoute() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "Administrator") {
    redirect("/");
  }

  return <PenggunaPage currentUserId={user.id} />;
}
