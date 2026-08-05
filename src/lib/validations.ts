import { z } from "zod";
import { MAX_FILE_SIZE } from "@/lib/constants";

export const suratSchema = z.object({
  nomor_surat: z
    .string()
    .trim()
    .min(1, "Nomor surat wajib diisi.")
    .max(200, "Nomor surat maksimal 200 karakter."),
  tanggal: z
    .string()
    .min(1, "Tanggal wajib diisi.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid."),
  perihal: z
    .string()
    .trim()
    .min(1, "Perihal wajib diisi.")
    .max(500, "Perihal maksimal 500 karakter."),
  jenis: z.enum(["Surat Masuk", "Surat Keluar"], {
    required_error: "Jenis wajib diisi.",
    invalid_type_error: "Jenis tidak valid.",
  }),
  tujuan: z
    .string()
    .trim()
    .min(1, "Tujuan wajib diisi.")
    .max(300, "Tujuan maksimal 300 karakter."),
  file_pdf: z.string().min(1, "Upload file PDF wajib diisi."),
});

export const suratFormSchema = z.object({
  nomor_surat: z
    .string()
    .trim()
    .min(1, "Nomor surat wajib diisi.")
    .max(200, "Nomor surat maksimal 200 karakter."),
  tanggal: z
    .string()
    .min(1, "Tanggal wajib diisi.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid."),
  perihal: z
    .string()
    .trim()
    .min(1, "Perihal wajib diisi.")
    .max(500, "Perihal maksimal 500 karakter."),
  tujuan: z
    .string()
    .trim()
    .min(1, "Tujuan wajib diisi.")
    .max(300, "Tujuan maksimal 300 karakter."),
});

export type SuratFormValues = z.infer<typeof suratFormSchema>;

export const pdfFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "application/pdf", {
    message: "File harus berformat PDF.",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Ukuran file maksimal 20 MB.",
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Username atau email wajib diisi."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().trim().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  full_name: z.string().trim().min(1, "Nama lengkap wajib diisi."),
  role: z.enum(["Administrator", "Operator"], {
    required_error: "Role wajib dipilih.",
  }),
});

export type RegisterValues = z.infer<typeof registerSchema>;
