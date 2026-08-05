"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Eye,
  Pencil,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { Surat } from "@/lib/types";

interface SuratTableProps {
  data: Surat[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onView: (surat: Surat) => void;
  onPreview: (surat: Surat) => void;
  onEdit?: (surat: Surat) => void;
  onDelete?: (surat: Surat) => void;
  showJenis?: boolean;
}

export function SuratTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onPreview,
  showJenis = false,
}: SuratTableProps) {
  const columns = useMemo<ColumnDef<Surat>[]>(
    () => [
      {
        accessorKey: "nomor_surat",
        header: "Nomor Surat",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.nomor_surat}</span>
        ),
      },
      {
        accessorKey: "tanggal",
        header: "Tanggal",
        cell: ({ row }) => formatDate(row.original.tanggal),
      },
      {
        accessorKey: "perihal",
        header: "Perihal",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[220px]">
            {row.original.perihal}
          </span>
        ),
      },
      ...(showJenis
        ? [
            {
              accessorKey: "jenis" as const,
              header: "Jenis",
              cell: ({ row }: { row: { original: Surat } }) => (
                <Badge
                  variant={
                    row.original.jenis === "Surat Masuk"
                      ? "default"
                      : "secondary"
                  }
                >
                  {row.original.jenis}
                </Badge>
              ),
            },
          ]
        : []),
      {
        accessorKey: "tujuan",
        header: "Tujuan",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[200px]">
            {row.original.tujuan}
          </span>
        ),
      },
      {
        accessorKey: "file_pdf",
        header: "PDF",
        cell: ({ row }) => (
          <button
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(row.original);
            }}
          >
            <FileText className="size-4" />
            Lihat PDF
          </button>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="Lihat"
              onClick={() => onView(row.original)}
            >
              <Eye className="size-4" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                title="Edit"
                onClick={() => onEdit(row.original)}
              >
                <Pencil className="size-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                title="Hapus"
                onClick={() => onDelete(row.original)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [showJenis, onView, onPreview, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="size-8" />
                    <p className="text-sm">Tidak ada data surat.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onView(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === "actions") {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium">{from}</span>-
          <span className="font-medium">{to}</span> dari{" "}
          <span className="font-medium">{total}</span> data
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Halaman {page} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
