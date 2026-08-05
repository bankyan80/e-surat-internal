"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLatestSurat } from "@/hooks/use-surat";
import { formatDate } from "@/lib/utils";

export function LatestSurat() {
  const router = useRouter();
  const { data, isLoading, isError } = useLatestSurat(10);

  return (
    <Card className="col-span-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Surat Terbaru</CardTitle>
          <CardDescription>10 surat terakhir yang ditambahkan.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/arsip")}
        >
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Gagal memuat data surat.
          </p>
        ) : (data ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <FileText className="size-8" />
            <p className="text-sm">Belum ada data surat.</p>
          </div>
        ) : (
          <div className="divide-y">
            {(data ?? []).map((surat) => (
              <Link
                key={surat.id}
                href={`/arsip`}
                className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {surat.nomor_surat}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {surat.perihal}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge
                    variant={
                      surat.jenis === "Surat Masuk" ? "default" : "secondary"
                    }
                  >
                    {surat.jenis}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {formatDate(surat.tanggal)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
