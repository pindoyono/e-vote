# 🗳️ E-Vote Sekolah

Platform pemilihan elektronik (ketua OSIS, ketua kelas, dan pemilihan lain) untuk semua jenjang: SD/MI, SMP/MTs, SMA/MA/SMK, SLB, dan satuan pendidikan lainnya. Setiap sekolah mendaftar dengan **NPSN** sebagai identitas, lalu mengelola data pemilihannya sendiri secara terpisah dari sekolah lain.

Dibangun dengan Next.js 15, TypeScript, TailwindCSS, Prisma (PostgreSQL), dan NextAuth.js.

## Alur penggunaan

1. **Sekolah mendaftar** di `/daftar`: NPSN, nama sekolah, jenjang, penanggung jawab, dan akun admin. Status awal *menunggu*.
2. **Pengelola platform** (super admin) memeriksa NPSN dan menyetujui pendaftaran di `/superadmin`.
3. **Admin sekolah** login di `/admin/login` dengan NPSN + username + password, lalu:
   - mengatur nama sekolah dan judul pemilihan (Pengaturan),
   - mengimpor/menambah data pemilih (NISN atau NIS),
   - menambah kandidat beserta foto,
   - membuat akun panitia.
4. **Panitia** login di `/committee/login` (NPSN + username + password) untuk memverifikasi pemilih di hari H. Setiap pemilih terverifikasi mendapat **token 8 karakter**.
5. **Admin membuka voting**. Pemilih memasukkan token di halaman depan atau di `/s/<NPSN>`, lalu memilih satu kandidat.
6. **Hasil** dipantau realtime di `/s/<NPSN>/monitoring`.

## Halaman

| URL | Untuk |
|---|---|
| `/` | Beranda platform, masukkan token, cari sekolah |
| `/daftar` | Pendaftaran sekolah |
| `/s/<NPSN>` | Halaman publik sekolah |
| `/s/<NPSN>/monitoring` | Hasil realtime sekolah |
| `/admin/*` | Panel admin sekolah |
| `/committee/*` | Panel panitia |
| `/superadmin` | Persetujuan & pengelolaan sekolah |
| `/vote/<TOKEN>` | Halaman memilih |

## Model data dan keamanan

- Tabel `schools` (NPSN unik, status `PENDING`/`ACTIVE`/`REJECTED`/`SUSPENDED`). Semua data lain (admin, panitia, kandidat, pemilih, suara, sesi voting) memiliki `schoolId`.
- Setiap API sekolah mengambil `schoolId` dari sesi login (bukan dari input) dan mengecek ulang bahwa sekolah masih `ACTIVE`, sehingga sekolah yang dinonaktifkan langsung terkunci walaupun sesinya masih berlaku.
- NISN/NIS dan nomor urut kandidat unik **per sekolah**; username admin/panitia unik per sekolah.
- Token pemilih: 8 karakter acak kriptografis tanpa huruf yang mirip (0/O, 1/I/L), unik global.
- Satu suara per pemilih dijaga atomik di transaksi dan oleh constraint unik di database.
- Kandidat/pemilih yang sudah memiliki suara tidak bisa dihapus (hasil tidak berubah diam-diam).
- Upload foto kandidat: hanya JPG/PNG/WebP (dicek dari isi file), maks 5 MB, nama file dibuat server.

## Pengembangan lokal

Prasyarat: Node.js 20+, PostgreSQL 14+.

```bash
npm ci
cp .env.example .env    # isi DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
npx prisma migrate dev
SUPERADMIN_USERNAME=admin SUPERADMIN_PASSWORD='password-minimal-12' node scripts/create-superadmin.mjs
npm run dev
```

Variabel lingkungan:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@127.0.0.1:5432/evote` |
| `NEXTAUTH_URL` | URL publik utama, mis. `https://e-vote.example.id` |
| `NEXTAUTH_SECRET` | Rahasia acak panjang (`openssl rand -base64 48`) |
| `UPLOAD_DIR` | Opsional: folder foto kandidat di luar kode; sajikan sebagai `/uploads/` lewat web server |

## Produksi (ringkas)

```bash
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3010
```

Jalankan sebagai user khusus lewat systemd, di belakang nginx (reverse proxy + HTTPS). Sajikan `UPLOAD_DIR` sebagai `/uploads/` langsung dari nginx, dan batasi laju (rate limit) `/api/auth/callback/`, `/api/register`, serta `/api/vote/`.

> Dokumen deployment lama (`VPS-DEPLOYMENT.md`, `deploy.sh`, `DOCKER.md`, dll.) ditulis untuk versi satu sekolah berbasis SQLite dan belum diperbarui.
