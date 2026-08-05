"use client";

import { History, UserRound, FilePlus2, FilePen, FileMinus2, LogIn, LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/hooks/use-surat";
import { formatDateTime } from "@/lib/utils";

const actionIcons: Record<string, typeof History> = {
  "Tambah surat": FilePlus2,
  "Edit surat": FilePen,
  "Hapus surat": FileMinus2,
  Login: LogIn,
  Logout: LogOut,
};

const actionColors: Record<string, string> = {
  "Tambah surat": "text-emerald-600",
  "Edit surat": "text-amber-600",
  "Hapus surat": "text-destructive",
  Login: "text-primary",
  Logout: "text-muted-foreground",
};

export function AuditLogPage() {
  const { data, isLoading, isError } = useAuditLogs(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catatan seluruh aktivitas pengguna di dalam sistem.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
          <CardDescription>100 aktivitas terbaru.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Gagal memuat audit log.
                    </TableCell>
                  </TableRow>
                ) : (data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Belum ada aktivitas.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data ?? []).map((log) => {
                    const Icon = actionIcons[log.action] ?? History;
                    const color = actionColors[log.action] ?? "text-muted-foreground";
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={`size-4 ${color}`} />
                            <span className="text-sm font-medium">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <UserRound className="size-3.5 text-muted-foreground" />
                            {log.user_email ?? "Sistem"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                          {log.detail ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(log.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
