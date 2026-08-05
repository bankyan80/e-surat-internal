"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";
import { suratSchema } from "@/lib/validations";
import type { Surat } from "@/lib/types";

export async function createSurat(input: unknown): Promise<{
  success: boolean;
  error?: string;
  data?: Surat;
}> {
  const parsed = suratSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Data surat tidak valid." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login terlebih dahulu." };
  }

  const { data, error } = await supabase
    .from("surat")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await recordAudit("Tambah surat", `${data.jenis}: ${data.nomor_surat}`);
  revalidatePath("/");
  revalidatePath("/surat-masuk");
  revalidatePath("/surat-keluar");
  revalidatePath("/arsip");

  return { success: true, data };
}

export async function updateSurat(
  id: string,
  input: unknown
): Promise<{ success: boolean; error?: string; data?: Surat }> {
  const parsed = suratSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Data surat tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("surat")
    .update({
      nomor_surat: parsed.data.nomor_surat,
      tanggal: parsed.data.tanggal,
      perihal: parsed.data.perihal,
      jenis: parsed.data.jenis,
      tujuan: parsed.data.tujuan,
      file_pdf: parsed.data.file_pdf,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await recordAudit("Edit surat", `${data.jenis}: ${data.nomor_surat}`);
  revalidatePath("/");
  revalidatePath("/surat-masuk");
  revalidatePath("/surat-keluar");
  revalidatePath("/arsip");

  return { success: true, data };
}

export async function deleteSurat(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("surat")
    .select("id, nomor_surat, jenis, file_pdf")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("surat").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (existing?.file_pdf) {
    const path = extractStoragePath(existing.file_pdf);
    if (path) {
      await supabase.storage.from("surat").remove([path]);
    }
  }

  await recordAudit(
    "Hapus surat",
    existing
      ? `${existing.jenis}: ${existing.nomor_surat}`
      : `Surat ID ${id}`
  );
  revalidatePath("/");
  revalidatePath("/surat-masuk");
  revalidatePath("/surat-keluar");
  revalidatePath("/arsip");

  return { success: true };
}

export async function getSuratById(id: string): Promise<Surat | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("surat")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

function extractStoragePath(urlOrPath: string): string | null {
  if (urlOrPath.startsWith("http")) {
    try {
      const url = new URL(urlOrPath);
      const match = url.pathname.match(
        /\/storage\/v1\/object\/public\/surat\/(.+)/
      );
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  }
  return urlOrPath.startsWith("surat/") ? urlOrPath : null;
}
