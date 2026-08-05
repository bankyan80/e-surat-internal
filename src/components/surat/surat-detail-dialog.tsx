"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getSignedFileUrl } from "@/lib/surat-service";
import type { Surat } from "@/lib/types";

interface SuratDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surat: Surat | null;
}

export function SuratDetailDialog({
  open,
  onOpenChange,
  surat,
}: SuratDetailDialogProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !surat) return;
    let cancelled = false;
    getSignedFileUrl(surat.file_pdf)
      .then((signedUrl) => {
        if (!cancelled) setUrl(signedUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, surat]);

  if (!surat) return null;

  const handleDownload = () => {
    if (url) window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Surat</DialogTitle>
          <DialogDescription>Informasi lengkap data surat.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={
                surat.jenis === "Surat Masuk" ? "default" : "secondary"
              }
            >
              {surat.jenis}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Diperbarui: {formatDateTime(surat.updated_at)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Nomor Surat
              </p>
              <p className="mt-1 font-medium">{surat.nomor_surat}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tanggal
              </p>
              <p className="mt-1">{formatDate(surat.tanggal)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Perihal
            </p>
            <p className="mt-1 leading-relaxed">{surat.perihal}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tujuan
            </p>
            <p className="mt-1">{surat.tujuan}</p>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              File PDF
            </p>
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-primary" />
                <span className="truncate text-sm">{surat.nomor_surat}.pdf</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={!url}
              >
                <Download className="size-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
