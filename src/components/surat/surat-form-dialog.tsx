"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, UploadCloud, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { suratFormSchema, type SuratFormValues } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useCreateSurat, useUpdateSurat } from "@/hooks/use-surat";
import { BUCKET_NAME, MAX_FILE_SIZE } from "@/lib/constants";
import { generateUUID } from "@/lib/utils";
import { toast } from "sonner";
import type { JenisSurat, Surat } from "@/lib/types";

interface SuratFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jenis: JenisSurat;
  surat?: Surat | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SuratFormDialog({
  open,
  onOpenChange,
  jenis,
  surat,
}: SuratFormDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [existingPath, setExistingPath] = useState<string | null>(null);

  const createSurat = useCreateSurat();
  const updateSurat = useUpdateSurat();

  const isEdit = Boolean(surat);
  const isSubmitting = uploading || createSurat.isPending || updateSurat.isPending;

  const form = useForm<SuratFormValues>({
    resolver: zodResolver(suratFormSchema),
    defaultValues: {
      nomor_surat: "",
      tanggal: "",
      perihal: "",
      tujuan: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nomor_surat: surat?.nomor_surat ?? "",
        tanggal: surat?.tanggal ?? "",
        perihal: surat?.perihal ?? "",
        tujuan: surat?.tujuan ?? "",
      });
      setFile(null);
      setExistingPath(surat?.file_pdf ?? null);
    }
  }, [open, surat, form]);

  const validateFile = (f: File): string | null => {
    if (f.type !== "application/pdf") {
      return "File harus berformat PDF.";
    }
    if (f.size > MAX_FILE_SIZE) {
      return "Ukuran file maksimal 20 MB.";
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const error = validateFile(selected);
    if (error) {
      toast.error(error);
      e.target.value = "";
      return;
    }

    setFile(selected);
  };

  const uploadFile = async (f: File): Promise<string> => {
    const supabase = createClient();
    const date = new Date().toISOString().slice(0, 10);
    const [year, month] = date.split("-");
    const bucketFolder = jenis === "Surat Masuk" ? "masuk" : "keluar";
    const fileId = generateUUID();
    const path = `surat/${bucketFolder}/${year}/${month}/${fileId}.pdf`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, f, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (error) {
      throw new Error(error.message);
    }

    return path;
  };

  const deleteOldFile = async (path: string | null) => {
    if (!path || !path.startsWith("surat/")) return;
    const supabase = createClient();
    await supabase.storage.from(BUCKET_NAME).remove([path]);
  };

  const onSubmit = async (values: SuratFormValues) => {
    const uploadPromise = file ? uploadFile(file) : Promise.resolve(existingPath);

    setUploading(true);
    try {
      const filePath = await uploadPromise;

      if (!filePath) {
        toast.error("Upload file PDF wajib diisi.");
        return;
      }

      const payload = {
        ...values,
        jenis,
        file_pdf: filePath,
      };

      if (isEdit && surat) {
        const result = await updateSurat.mutateAsync({
          id: surat.id,
          input: payload,
        });
        if (!result.success) {
          toast.error(result.error ?? "Gagal mengupdate surat.");
          return;
        }
        if (file && existingPath && existingPath !== filePath) {
          await deleteOldFile(existingPath);
        }
        toast.success("Surat berhasil diperbarui.");
      } else {
        const result = await createSurat.mutateAsync(payload);
        if (!result.success) {
          toast.error(result.error ?? "Gagal menambah surat.");
          return;
        }
        toast.success("Surat berhasil ditambahkan.");
      }

      onOpenChange(false);
      form.reset();
      setFile(null);
      setExistingPath(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan saat upload."
      );
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = isEdit ? file || existingPath : Boolean(file);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Surat" : "Tambah Surat"} - {jenis}
          </DialogTitle>
          <DialogDescription>
            Lengkapi data surat di bawah ini. Field jenis otomatis bernilai{" "}
            {jenis}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Jenis</FormLabel>
              <Badge variant="secondary">{jenis}</Badge>
            </FormItem>

            <FormField
              control={form.control}
              name="nomor_surat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Surat</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 421.1/123/Dikdas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="perihal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perihal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tuliskan perihal surat"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tujuan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tujuan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        jenis === "Surat Masuk"
                          ? "Nama instansi/pengirim"
                          : "Nama instansi/tujuan"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>File PDF</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <label
                    htmlFor="pdf-upload"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/50"
                  >
                    <UploadCloud className="size-8 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Klik untuk pilih file PDF
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Maksimal 20 MB, format PDF
                    </span>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  {(file || existingPath) && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="size-4 shrink-0 text-primary" />
                        <span className="truncate text-sm">
                          {file?.name ?? "File PDF sudah ada"}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {file && (
                          <span className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => {
                            setFile(null);
                            if (isEdit) setExistingPath(null);
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
