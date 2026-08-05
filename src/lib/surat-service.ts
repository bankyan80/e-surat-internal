import { createClient } from "@/lib/supabase/client";
import type {
  MonthlyData,
  PaginatedResult,
  Surat,
  SuratCounts,
  SuratQuery,
  AuditLog,
  Profile,
} from "@/lib/types";

export async function fetchSurat(
  query: SuratQuery
): Promise<PaginatedResult<Surat>> {
  const supabase = createClient();
  const {
    page,
    pageSize,
    search,
    jenis,
    tanggalFrom,
    tanggalTo,
    bulan,
    tahun,
  } = query;

  let builder = supabase
    .from("surat")
    .select("*", { count: "exact" });

  if (jenis) {
    builder = builder.eq("jenis", jenis);
  }

  if (search) {
    const escaped = search.replace(/[%,]/g, "\\$&");
    const term = `%${escaped}%`;
    builder = builder.or(
      `nomor_surat.ilike.${term},perihal.ilike.${term},tujuan.ilike.${term}`
    );
  }

  if (tanggalFrom) {
    builder = builder.gte("tanggal", tanggalFrom);
  }

  if (tanggalTo) {
    builder = builder.lte("tanggal", tanggalTo);
  }

  if (tahun) {
    builder = builder.gte("tanggal", `${tahun}-01-01`).lte("tanggal", `${tahun}-12-31`);
  }

  if (bulan && tahun) {
    const monthStr = String(bulan).padStart(2, "0");
    builder = builder
      .gte("tanggal", `${tahun}-${monthStr}-01`)
      .lte("tanggal", `${tahun}-${monthStr}-31`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await builder
    .order("tanggal", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    data: (data as Surat[]) ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function fetchSuratCounts(): Promise<SuratCounts> {
  const supabase = createClient();
  const [masuk, keluar] = await Promise.all([
    supabase
      .from("surat")
      .select("id", { count: "exact", head: true })
      .eq("jenis", "Surat Masuk"),
    supabase
      .from("surat")
      .select("id", { count: "exact", head: true })
      .eq("jenis", "Surat Keluar"),
  ]);

  const totalMasuk = masuk.count ?? 0;
  const totalKeluar = keluar.count ?? 0;

  return {
    masuk: totalMasuk,
    keluar: totalKeluar,
    total: totalMasuk + totalKeluar,
  };
}

export async function fetchMonthlyData(year: number): Promise<MonthlyData[]> {
  const supabase = createClient();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const { data, error } = await supabase
    .from("surat")
    .select("tanggal, jenis")
    .gte("tanggal", start)
    .lte("tanggal", end);

  if (error) {
    throw new Error(error.message);
  }

  const result: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    masuk: 0,
    keluar: 0,
  }));

  for (const item of data ?? []) {
    const month = new Date(item.tanggal).getMonth();
    if (item.jenis === "Surat Masuk") {
      result[month].masuk += 1;
    } else if (item.jenis === "Surat Keluar") {
      result[month].keluar += 1;
    }
  }

  return result;
}

export async function fetchLatestSurat(limit = 10): Promise<Surat[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("surat")
    .select("*")
    .order("tanggal", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as Surat[]) ?? [];
}

export async function fetchProfiles(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as Profile[]) ?? [];
}

export async function fetchAuditLogs(
  limit = 50
): Promise<AuditLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as AuditLog[]) ?? [];
}

export async function getSignedFileUrl(
  path: string
): Promise<string | null> {
  const supabase = createClient();
  const storagePath = path.startsWith("surat/")
    ? path
    : decodeURIComponent(path.replace(/^\/storage\/v1\/object\/public\/surat\//, ""));

  const { data, error } = await supabase.storage
    .from("surat")
    .createSignedUrl(storagePath, 3600);

  if (error || !data) return null;
  return data.signedUrl;
}
