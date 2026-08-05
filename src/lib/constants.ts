import type { JenisSurat, Role } from "@/lib/types";

export const JENIS_SURAT: JenisSurat[] = ["Surat Masuk", "Surat Keluar"];

export const ROLE_ADMIN: Role = "Administrator";
export const ROLE_OPERATOR: Role = "Operator";

export const ROLE_LABELS: Record<Role, string> = {
  Administrator: "Administrator",
  Operator: "Operator",
};

export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = ["application/pdf"];

export const PAGE_SIZE = 10;

export const BUCKET_NAME = "surat";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
  },
  {
    title: "Surat Masuk",
    href: "/surat-masuk",
    icon: "Inbox",
  },
  {
    title: "Surat Keluar",
    href: "/surat-keluar",
    icon: "Send",
  },
  {
    title: "Arsip Surat",
    href: "/arsip",
    icon: "Archive",
  },
] as const;

export const APP_NAME = "SIMSURAT";
export const APP_FULL_NAME = "Sistem Informasi Manajemen Surat Internal";
export const INSTITUTION_NAME =
  "Tim Kerja Bidang Pendidikan Sekolah Dasar Kecamatan Lemahabang Kabupaten Cirebon";
