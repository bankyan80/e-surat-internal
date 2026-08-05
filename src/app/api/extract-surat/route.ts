import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractSuratFromPdf } from "@/lib/extract-surat";
import { BUCKET_NAME, MAX_FILE_SIZE } from "@/lib/constants";
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

  let path: string | null = null;
  let jenisParam: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    jenisParam = formData.get("jenis")?.toString() ?? null;

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

    path = null;
    const blob = file;
    const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
    return handleExtraction(base64, jenisParam);
  }

  const body = (await request.json().catch(() => null)) as {
    path?: string;
    jenis?: string;
  } | null;
  path = body?.path ?? null;
  jenisParam = body?.jenis ?? null;

  if (!path) {
    return NextResponse.json({ error: "Path file tidak ditemukan." }, { status: 400 });
  }

  if (!path.startsWith("surat/")) {
    return NextResponse.json({ error: "Path file tidak valid." }, { status: 400 });
  }

  const { data: fileBlob, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);

  if (error || !fileBlob) {
    return NextResponse.json(
      { error: "File tidak ditemukan di penyimpanan." },
      { status: 404 }
    );
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 20 MB." },
      { status: 400 }
    );
  }

  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return handleExtraction(base64, jenisParam);
}

async function handleExtraction(base64: string, jenisParam: string | null) {
  const jenis: JenisSurat =
    jenisParam === "Surat Keluar" ? "Surat Keluar" : "Surat Masuk";

  try {
    const { data, source } = await extractSuratFromPdf(base64, jenis);
    return NextResponse.json({ success: true, source, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal membaca surat.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
