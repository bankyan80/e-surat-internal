"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlyData } from "@/hooks/use-surat";
import { monthLabel } from "@/lib/utils";

export function MonthlyChart() {
  const year = new Date().getFullYear();
  const { data, isLoading, isError } = useMonthlyData(year);

  const chartData = (data ?? []).map((item) => ({
    bulan: monthLabel(item.month - 1),
    "Surat Masuk": item.masuk,
    "Surat Keluar": item.keluar,
  }));

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Grafik Jumlah Surat per Bulan</CardTitle>
        <CardDescription>
          Statistik surat masuk dan surat keluar tahun {year}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : isError ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Gagal memuat data grafik.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="bulan"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="Surat Masuk"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="Surat Keluar"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
