import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractSuratFromPdf } from "@/lib/extract-surat";
import { MAX_FILE_SIZE } from "@/lib/constants";
import type { JenisSurat } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const jenisParam = formData.get("jenis");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "File tidak ditemukan." },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "File harus berformat PDF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 20 MB." },
      { status: 400 }
    );
  }

  const jenis: JenisSurat =
    jenisParam === "Surat Keluar" ? "Surat Keluar" : "Surat Masuk";

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const { data, source } = await extractSuratFromPdf(base64, jenis);
    return NextResponse.json({ success: true, source, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal membaca surat.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
