import type { Metadata } from "next";
import { SuratListPage } from "@/components/surat/surat-list-page";

export const metadata: Metadata = {
  title: "Surat Keluar",
};

export default function SuratKeluarPage() {
  return (
    <SuratListPage
      title="Surat Keluar"
      description="Kelola data surat keluar Tim Kerja Bidang Pendidikan Sekolah Dasar."
      jenis="Surat Keluar"
    />
  );
}
