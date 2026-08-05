export type JenisSurat = "Surat Masuk" | "Surat Keluar";

export type Role = "Administrator" | "Operator";

export interface Surat {
  id: string;
  nomor_surat: string;
  tanggal: string;
  perihal: string;
  jenis: JenisSurat;
  tujuan: string;
  file_pdf: string;
  created_at: string;
  updated_at: string;
}

export interface SuratInsert {
  nomor_surat: string;
  tanggal: string;
  perihal: string;
  jenis: JenisSurat;
  tujuan: string;
  file_pdf: string;
}

export interface SuratUpdate {
  nomor_surat?: string;
  tanggal?: string;
  perihal?: string;
  jenis?: JenisSurat;
  tujuan?: string;
  file_pdf?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  detail: string | null;
  created_at: string;
}

export type AuditAction =
  | "Tambah surat"
  | "Edit surat"
  | "Hapus surat"
  | "Login"
  | "Logout";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SuratQuery {
  page: number;
  pageSize: number;
  search: string;
  jenis?: JenisSurat;
  tanggalFrom?: string;
  tanggalTo?: string;
  bulan?: number;
  tahun?: number;
}

export interface SuratCounts {
  masuk: number;
  keluar: number;
  total: number;
}

export interface MonthlyData {
  month: number;
  masuk: number;
  keluar: number;
}
