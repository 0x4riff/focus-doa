# Technical Documentation — Focus & Doa

Dokumen ini ditulis sebagai panduan teknis bagi developer, backend engineer, dan DevOps engineer untuk memahami arsitektur, basis kode, skema database, serta alur deployment proyek **Focus & Doa**.

---

## 1. Ringkasan Arsitektur Sistem

Aplikasi ini menggunakan pola arsitektur **Serverless Single-Page Application (SPA)** berbasis PWA dengan Next.js sebagai framework frontend dan Supabase sebagai Backend-as-a-Service (BaaS).

```
[Browser / Client PWA]
        │
        ├── (Next.js Routing & Local State)
        ├── (Logic Lokal: Kalender Jawa, Weton, Choghadiya)
        │
        ├── [Supabase Client SDK / Auth & DB Operations] ──> [Supabase Backend (Auth, Postgres, RLS)]
        └── [Server-Side Fetch] ──> [Aladhan API (Prayer Timings & Hijri)]
```

---

## 2. Struktur Direktori Proyek

```text
focus-doa/
├── public/                 # Aset statis & manifest PWA
│   └── manifest.json       # Konfigurasi PWA (tampilan, warna, ikon)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout, metadata apple-capable, & viewport theme
│   │   └── page.tsx        # Entry point utama (Auth gate & tab routing)
│   ├── components/         # Komponen UI modular per tab
│   │   ├── AuthCard.tsx    # Form Login/Register (dynamic redirect URL)
│   │   ├── DashboardTab.tsx# Halaman utama (Jadwal Shalat, Choghadiya, Kalender)
│   │   ├── Navigation.tsx  # Bottom navigation bar
│   │   ├── NotesTab.tsx    # CRUD Catatan harian
│   │   ├── PlannerTab.tsx  # CRUD Target produktivitas
│   │   ├── PrayerTab.tsx   # Checklist ibadah shalat wajib
│   │   ├── RemindersTab.tsx# CRUD Alarm kustom harian
│   │   └── SettingsTab.tsx # Profiling user (Kota, Tanggal Lahir untuk Weton)
│   ├── data/
│   │   └── duas.ts         # Koleksi data doa harian statis
│   ├── lib/
│   │   ├── api/
│   │   │   └── aladhan.ts  # Client API Aladhan (jadwal shalat & Hijriah)
│   │   ├── db/             # Abstract layer untuk query database Supabase
│   │   └── supabase/       # Konfigurasi instansiasi Supabase SSR (client, server, middleware)
│   ├── utils/
│   │   ├── choghadiya.ts   # Algoritma perhitungan Choghadiya berdasarkan sunrise/sunset
│   │   └── javaneseCalendar.ts # Perhitungan pasaran Jawa dan weton kelahiran
│   └── middleware.ts       # Global routing middleware untuk refreshing session cookie
├── .env.example            # Template environment variables
├── supabase-schema.sql     # Skema database relasional
└── DEVELOPMENT.md          # Dokumen ini
```

---

## 3. Frontend Architecture & Logic

### A. Progressive Web App (PWA)
Aplikasi dikonfigurasi sebagai PWA agar dapat diinstal di Android (Chrome) dan iOS (Safari).
- **Manifest:** Dikontrol di `/public/manifest.json`.
- **Safari Support:** Tag `apple-mobile-web-app-capable` dikonfigurasi di metadata layout `src/app/layout.tsx`.
- **Responsive Layout:** Menggunakan pembatas container maksimal lebar mobile (`max-w-md mx-auto`) dengan Tailwind CSS untuk menyimulasikan nuansa aplikasi native.

### B. Algoritma Lokal
1. **Kalender Jawa & Weton (`src/utils/javaneseCalendar.ts`)**
   - Menggunakan tanggal jangkar referensi: **1 Januari 2024 (Senin Pahing)**.
   - Selisih hari dihitung secara absolut untuk menemukan indeks pasaran menggunakan operasi modulo 5 terhadap array `['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']`.
2. **Choghadiya (`src/utils/choghadiya.ts`)**
   - Menghitung pembagian waktu harian (8 periode siang dan 8 periode malam).
   - Waktu siang didasarkan pada interval `(Sunset - Sunrise) / 8`. Waktu malam didasarkan pada `(Sunrise Esok Hari - Sunset Hari Ini) / 8`.
   - Urutan siklus berubah secara dinamis berdasarkan hari dalam seminggu (`date.getDay()`).

---

## 4. Backend & Database (Supabase)

Supabase menangani otentikasi user dan penyimpanan data persisten dengan database PostgreSQL.

### A. Relational Database Schema
Database terdiri dari tabel-tabel berikut:
- **`profiles`**: Menyimpan detail profil dasar pengguna. Relasi `id` berelasi 1:1 ke `auth.users`.
- **`daily_plans`**: Menyimpan daftar to-do pengguna berdasarkan tanggal.
- **`prayer_checklists`**: Menyimpan rekam jejak shalat 5 waktu harian pengguna.
- **`notes`**: Catatan pribadi pengguna yang dikategorikan.
- **`reminders`**: Pengingat kustom berbasis waktu yang diaktifkan pengguna.
- **`favorite_duas`**: Relasi *junction* untuk menyimpan daftar doa favorit pengguna.

### B. Row Level Security (RLS)
Semua tabel memiliki kebijakan RLS aktif untuk memastikan keamanan data:
- Pengguna hanya diperbolehkan melakukan `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` pada baris data yang memiliki nilai `user_id` sama dengan `auth.uid()` (ID session mereka).

### C. Trigger Otomatis Pembuatan Profil
Untuk memastikan integritas data, terdapat trigger PostgreSQL di skema database yang otomatis membuat entri baru di tabel `public.profiles` sesaat setelah pengguna menyelesaikan registrasi di modul otentikasi (`auth.users`):
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 5. Panduan DevOps & Deployment

### A. Local Development Setup
1. Pastikan Node.js v18+ atau v20+ terinstall.
2. Salin `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Isi nilai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan kredensial dari dashboard Supabase Anda.
4. Install dependency dan jalankan server lokal:
   ```bash
   npm install
   npm run dev
   ```

### B. Integrasi Vercel & Supabase
Proyek dideploy menggunakan platform Vercel dengan integrasi Supabase.
- Setiap kali developer melakukan push ke branch `master`, Vercel akan secara otomatis melakukan build dan deployment.
- Environment variables disinkronkan secara otomatis melalui integrasi resmi Vercel-Supabase.
- Apabila terjadi perubahan struktur database, jalankan skrip SQL dari `supabase-schema.sql` di SQL Editor dashboard Supabase.

### C. Konfigurasi Verifikasi Email
Jika fitur verifikasi registrasi Supabase diaktifkan:
- Developer wajib masuk ke **Supabase Dashboard -> Authentication -> URL Configuration**.
- Ubah **Site URL** menjadi domain production: `https://focus-doa.vercel.app` agar tautan konfirmasi email tidak mengarah ke `localhost`.
