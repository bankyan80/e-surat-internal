import { createClient } from "@/lib/supabase/server";
import type { AuditAction } from "@/lib/types";

export async function recordAudit(
  action: AuditAction,
  detail?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      action,
      detail: detail ?? null,
    });
  } catch {
    // Kegagalan audit tidak boleh menghentikan operasi utama.
  }
}
