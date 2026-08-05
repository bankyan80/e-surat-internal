# SIMSURAT - Sistem Informasi Manajemen Surat Internal

Aplikasi web modern untuk mengelola surat internal **Tim Kerja Bidang Pendidikan Sekolah Dasar Kecamatan Lemahabang Kabupaten Cirebon**.

Dibangun menggunakan **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, dan **Supabase**.

## Fitur

- **Autentikasi** dengan Supabase Authentication (role: Administrator & Operator)
- **Dashboard** dengan ringkasan jumlah surat, grafik per bulan, dan 10 surat terbaru
- **Surat Masuk** - CRUD surat masuk, preview & download PDF, pencarian, filter, pagination
- **Surat Keluar** - CRUD surat keluar, preview & download PDF, pencarian, filter, pagination
- **Arsip Surat** - gabungan surat masuk & keluar, filter, urutkan tanggal terbaru, pagination
- **Manajemen Pengguna** (khusus Administrator)
- **Audit Log** - catatan tambah/edit/hapus surat, login, dan logout
- **Dark mode** & desain responsif

## Teknologi

| Teknologi | Versi |
|-----------|-------|
| Next.js | 15 (App Router) |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| shadcn/ui | Latest |
| Lucide React | Latest |
| Supabase (PostgreSQL, Auth, Storage) | Latest |
| React Hook Form | Latest |
| Zod | Latest |
| TanStack Table | 8 |
| TanStack Query | 5 |
| Recharts | Latest |
| Vercel | Hosting |

## Persyaratan

- Node.js 20.9+ atau 22+
- npm 10+
- Akun Supabase (proyek gratis sudah cukup)
- Akun GitHub
- Akun Vercel

## Struktur Project

```
├── src/
│   ├── app/
│   │   ├── (main)/            # Halaman yang dilindungi autentikasi
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── surat-masuk/   # Surat Masuk
│   │   │   ├── surat-keluar/  # Surat Keluar
│   │   │   ├── arsip/         # Arsip Surat
│   │   │   ├── pengguna/      # Manajemen Pengguna (admin)
│   │   │   └── audit-log/     # Audit Log (admin)
│   │   ├── api/file/          # API signed URL PDF
│   │   ├── login/             # Halaman login
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/              # Form login
│   │   ├── dashboard/         # Stat cards, grafik, surat terbaru
│   │   ├── layout/            # Sidebar, navbar, app shell
│   │   ├── surat/             # Tabel, form, dialog PDF, filter
│   │   ├── pengguna/          # Manajemen pengguna
│   │   ├── audit-log/         # Audit log
│   │   ├── providers/         # Query, theme, search provider
│   │   └── ui/                # Komponen shadcn/ui
│   ├── hooks/                 # TanStack Query hooks
│   ├── lib/
│   │   ├── supabase/          # Client browser/server/middleware
│   │   ├── audit.ts           # Pencatatan audit
│   │   ├── auth-actions.ts    # Server actions autentikasi
│   │   ├── constants.ts       # Konstanta aplikasi
│   │   ├── surat-actions.ts   # Server actions CRUD surat
│   │   ├── surat-service.ts   # Query Supabase
│   │   ├── types.ts           # Type definitions
│   │   ├── validations.ts     # Skema validasi Zod
│   │   └── utils.ts           # Helper
│   └── middleware.ts          # Proteksi rute
├── supabase/migrations/       # Skema database
└── .env.example
```

## Instalasi Lokal

### 1. Clone repository

```bash
git clone https://github.com/USERNAME/e-surat-internal.git
cd e-surat-internal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Siapkan Supabase

1. Buat proyek baru di [Supabase](https://supabase.com).
2. Buka menu **SQL Editor**, jalankan isi file `supabase/migrations/00001_init.sql` untuk membuat tabel, RLS, dan storage.
3. Buat bucket storage bernama `surat` (private):
   - Menu **Storage** -> **New bucket** -> Nama: `surat`, centang "Private bucket".
4. Buat user admin pertama:
   - Menu **Authentication** -> **Users** -> **Add user**, isi email & password.
   - Jalankan di SQL Editor: `update public.profiles set role = 'Administrator' where email = '<email_admin>';`

### 4. Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi dengan nilai dari halaman **Project Settings > API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000 dan login dengan akun admin.

## Deploy ke Vercel

### Opsi 1: Auto-deploy dari GitHub

1. Push project ke GitHub.
2. Buka [Vercel](https://vercel.com) dan klik **New Project**.
3. Import repository, Vercel otomatis mendeteksi Next.js.
4. Tambahkan Environment Variables yang sama seperti `.env.local`.
5. Klik **Deploy**.

### Opsi 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

## Struktur Database

### Tabel `surat`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key, otomatis |
| nomor_surat | text | Nomor surat (wajib) |
| tanggal | date | Tanggal surat (wajib) |
| perihal | text | Perihal surat (wajib) |
| jenis | text | `Surat Masuk` / `Surat Keluar` |
| tujuan | text | Tujuan surat (wajib) |
| file_pdf | text | Path file di storage |
| created_at | timestamptz | Otomatis |
| updated_at | timestamptz | Otomatis |

### Tabel `profiles`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Referensi `auth.users` |
| email | text | Email user |
| full_name | text | Nama lengkap |
| role | text | `Administrator` / `Operator` |
| created_at | timestamptz | Otomatis |
| updated_at | timestamptz | Otomatis |

### Tabel `audit_logs`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| user_id | UUID | Referensi `auth.users` |
| user_email | text | Email pelaku |
| action | text | Jenis aktivitas |
| detail | text | Detail aktivitas |
| created_at | timestamptz | Otomatis |

### Storage Bucket: `surat`

```
surat/
├── masuk/
│   └── YYYY/
│       └── MM/
│           └── uuid.pdf
└── keluar/
    └── YYYY/
        └── MM/
            └── uuid.pdf
```

- Hanya file **PDF** yang diizinkan.
- Ukuran maksimal **20 MB**.
- Bucket privat, diakses via signed URL.

## Role Pengguna

| Kemampuan | Administrator | Operator |
|-----------|:------------:|:--------:|
| CRUD Surat Masuk | ✅ | ✅ |
| CRUD Surat Keluar | ✅ | ✅ |
| Lihat Arsip | ✅ | ✅ |
| Kelola Pengguna | ✅ | ❌ |
| Lihat Audit Log | ✅ | ❌ |

## Skrip

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan mode development |
| `npm run build` | Build production |
| `npm run start` | Jalankan production build |
| `npm run lint` | Jalankan ESLint |
| `npx tsc --noEmit` | Cek TypeScript |

## Lisensi

Hak cipta dimiliki oleh Tim Kerja Bidang Pendidikan Sekolah Dasar Kecamatan Lemahabang Kabupaten Cirebon.
