import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditLogPage } from "@/components/audit-log/audit-log-page";

export const metadata: Metadata = {
  title: "Audit Log",
};

export const dynamic = "force-dynamic";

export default async function AuditLogRoute() {
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

  return <AuditLogPage />;
}
