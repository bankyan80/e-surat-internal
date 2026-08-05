import type { Metadata } from "next";
import { ArsipPage } from "@/components/surat/arsip-page";

export const metadata: Metadata = {
  title: "Arsip Surat",
};

export default function ArsipSuratPage() {
  return <ArsipPage />;
}
