import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Path tidak ditemukan." }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const storagePath = path.startsWith("surat/")
    ? path
    : decodeURIComponent(path.replace(/^\/storage\/v1\/object\/public\/surat\//, ""));

  const { data, error } = await supabase.storage
    .from("surat")
    .createSignedUrl(storagePath, 3600);

  if (error || !data) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
