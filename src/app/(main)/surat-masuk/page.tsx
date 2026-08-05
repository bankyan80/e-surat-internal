import type { Metadata } from "next";
import { SuratListPage } from "@/components/surat/surat-list-page";

export const metadata: Metadata = {
  title: "Surat Masuk",
};

export default function SuratMasukPage() {
  return (
    <SuratListPage
      title="Surat Masuk"
      description="Kelola data surat masuk Tim Kerja Bidang Pendidikan Sekolah Dasar."
      jenis="Surat Masuk"
    />
  );
}
