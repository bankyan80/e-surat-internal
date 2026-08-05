"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Surat } from "@/lib/types";

interface DeleteSuratDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surat: Surat | null;
  onConfirm: (surat: Surat) => void;
  loading?: boolean;
}

export function DeleteSuratDialog({
  open,
  onOpenChange,
  surat,
  onConfirm,
  loading,
}: DeleteSuratDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Surat?</DialogTitle>
          <DialogDescription>
            Surat dengan nomor{" "}
            <span className="font-semibold">{surat?.nomor_surat}</span> beserta
            file PDF-nya akan dihapus secara permanen. Tindakan ini tidak dapat
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => surat && onConfirm(surat)}
            disabled={loading || !surat}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
