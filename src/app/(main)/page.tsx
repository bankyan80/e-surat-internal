import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { LatestSurat } from "@/components/dashboard/latest-surat";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan manajemen surat internal."
      />
      <StatCards />
      <MonthlyChart />
      <LatestSurat />
    </div>
  );
}
