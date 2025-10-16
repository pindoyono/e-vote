# 🗳️ E-Vote SMK N 2 Malinau

Aplikasi pemilihan elektronik (e-voting) untuk memilih Ketua OSIS SMK Negeri 2 Malinau tahun 2025. Aplikasi ini dibangun menggunakan Next.js dengan TypeScript, TailwindCSS, dan Prisma sebagai ORM database.

## ✨ Fitur Utama

### 🔐 Admin Panel
- **Autentikasi Admin**: Login aman dengan NextAuth.js
- **Manajemen Data Pemilih**: CRUD pemilih, import/export CSV
- **Manajemen Kandidat**: CRUD kandidat dengan upload foto
- **Verifikasi Pemilih**: Generate URL voting unik untuk setiap pemilih
- **Dashboard Real-time**: Monitoring hasil pemilihan secara langsung
- **Kontrol Pemilihan**: Aktifkan/nonaktifkan sesi voting
- **Reset Data**: Reset semua data voting jika diperlukan

### 👥 Committee Panel
- **Login Panitia**: Akses terpisah untuk panitia pemilihan
- **Verifikasi Pemilih**: Panitia dapat memverifikasi data pemilih
- **Manajemen Token**: Generate dan kelola token voting

### 🗳️ Sistem Voting
- **URL Unik**: Setiap pemilih mendapat URL voting yang unik dan aman (5 karakter)
- **Interface Responsif**: Desain yang user-friendly dan mobile-responsive
- **Foto Kandidat**: Tampilan foto kandidat yang professional
- **Validasi Ketat**: Satu pemilih hanya bisa voting sekali
- **Audit Trail**: Pencatatan IP address dan user agent untuk keamanan

### 📊 Monitoring Real-time
- **Dashboard Publik**: Pantau hasil secara real-time tanpa login
- **Grafik Interaktif**: Bar chart dan pie chart hasil pemilihan
- **Statistik Lengkap**: Total pemilih, partisipasi, dan sebaran suara
- **Update Otomatis**: Refresh data setiap 5 detik

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite dengan Prisma ORM
- **Authentication**: NextAuth.js
- **File Upload**: Multer (untuk foto kandidat)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod
- **Forms**: React Hook Form

## 🚀 Quick Start

### Prasyarat
- Node.js 18+ 
- npm atau yarn atau pnpm

### Instalasi Cepat

```bash
# Clone repository
git clone https://github.com/pindoyono/e-vote.git
cd e-vote

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Seed initial data
npx prisma db seed

# Start development server
npm run dev
```

**Akses aplikasi di http://localhost:3000**
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-here"
   ```

4. **Setup Database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Seed Data**
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```

7. **Akses Aplikasi**
   - Homepage: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/login
   - Monitoring: http://localhost:3000/monitoring

## 👥 Default Users

### Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Akses**: `/admin/login`

### Committee (Panitia)
- **Username**: `panitia`
- **Password**: `panitia123`
- **Akses**: `/committee/login`

### Kandidat Default
1. **Ahmad Rizki Pratama** (XII RPL 1) - Kandidat 1
2. **Siti Nurhaliza** (XII TKJ 1) - Kandidat 2
3. **Muhammad Fajar Sidiq** (XII OTKP 1) - Kandidat 3

## 📋 Panduan Penggunaan

### Untuk Admin

1. **Login ke Admin Panel**
   - Kunjungi `/admin/login`
   - Masukkan username: `admin` dan password: `admin123`

2. **Mengelola Data Pemilih**
   - Buka menu "Data Pemilih"
   - **Tambah Manual**: Klik "Tambah Pemilih" dan isi form
   - **Import CSV**: Upload file CSV dengan format `Nama,Kelas,NISN`
   - **Export CSV**: Download template atau data pemilih

3. **Mengelola Kandidat**
   - Buka menu "Kandidat"
   - **Tambah Kandidat**: Klik "Tambah Kandidat"
   - **Upload Foto**: Pilih foto kandidat (max 2MB, JPG/PNG)
   - **Edit Kandidat**: Klik tombol edit untuk mengubah data
   - **Hapus Kandidat**: Klik tombol hapus dengan konfirmasi

4. **Verifikasi Pemilih**
   - Buka menu "Verifikasi"
   - Klik "Verifikasi" untuk mengonfirmasi data pemilih
   - Salin URL voting yang dihasilkan (format: `/vote/ABC12`)
   - Berikan URL kepada pemilih yang bersangkutan

5. **Mengaktifkan Pemilihan**
   - Buka menu "Pengaturan"
   - Klik "Aktifkan Voting"
   - Pemilih dapat mulai voting setelah voting diaktifkan

6. **Monitoring Hasil**
   - Buka menu "Dashboard" untuk melihat hasil real-time
   - Atau kunjungi `/monitoring` untuk tampilan full-screen

### Untuk Committee (Panitia)

1. **Login Committee Panel**
   - Kunjungi `/committee/login`
   - Masukkan username: `panitia` dan password: `panitia123`

2. **Verifikasi Pemilih**
   - Akses halaman verifikasi
   - Cari pemilih berdasarkan nama atau kelas
   - Verifikasi data pemilih dan generate token voting

### Untuk Pemilih

1. **Akses URL Voting**
   - Buka URL yang diberikan oleh panitia
   - Format: `/vote/[token-5-karakter]`

2. **Melakukan Voting**
   - Lihat foto dan nomor urut ketiga kandidat
   - Pilih salah satu kandidat dengan klik "PILIH"
   - Konfirmasi pilihan dengan "SUBMIT SUARA"
   - **Pilihan tidak dapat diubah setelah dikonfirmasi**

3. **Konfirmasi**
   - Setelah voting, akan muncul halaman terima kasih
   - URL voting tidak dapat digunakan lagi

## 🔒 Keamanan

- **Token Unik**: Setiap pemilih mendapat token yang di-generate secara random
- **Validasi Database**: Cek duplikasi dan validasi data
- **Session Management**: Menggunakan NextAuth.js
- **Audit Logging**: IP address dan user agent dicatat
- **One-time Vote**: Satu pemilih hanya bisa voting sekali

## 📊 Database Schema

### Admin
- `id`: String (Primary Key)
- `username`: String (Unique)
- `password`: String (Hashed with bcrypt)
- `name`: String

### Committee
- `id`: String (Primary Key)
- `username`: String (Unique)
- `password`: String (Hashed with bcrypt)
- `name`: String

### Voter
- `id`: String (Primary Key)
- `name`: String
- `class`: String
- `nisn`: String (Unique)
- `isVerified`: Boolean
- `hasVoted`: Boolean
- `voteToken`: String (Unique, 5 characters)

### Candidate
- `id`: String (Primary Key)
- `name`: String
- `class`: String
- `vision`: String
- `mission`: String
- `photo`: String (Path to uploaded image)
- `orderNumber`: Integer (Unique)

### Vote
- `id`: String (Primary Key)
- `voterId`: String (Foreign Key)
- `candidateId`: String (Foreign Key)
- `voteToken`: String
- `ipAddress`: String
- `userAgent`: String
- `createdAt`: DateTime

### VotingSession
- `id`: String (Primary Key)
- `isActive`: Boolean
- `startTime`: DateTime
- `endTime`: DateTime

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login admin/committee
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Admin APIs
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/voters` - Get all voters
- `POST /api/admin/voters` - Create voter
- `PUT /api/admin/voters/[id]` - Update voter
- `DELETE /api/admin/voters/[id]` - Delete voter
- `POST /api/admin/voters/[id]/verify` - Verify voter
- `GET /api/admin/voters/unverified` - Get unverified voters
- `POST /api/admin/voters/import` - Import voters from CSV
- `GET /api/admin/voters/template` - Download CSV template

### Candidate APIs
- `GET /api/admin/candidates` - Get all candidates
- `POST /api/admin/candidates` - Create candidate (with photo upload)
- `PUT /api/admin/candidates/[id]` - Update candidate (with photo upload)
- `DELETE /api/admin/candidates/[id]` - Delete candidate

### Voting Session APIs
- `GET /api/admin/voting-session` - Get voting session status
- `POST /api/admin/voting-session` - Manage voting session

### Voting APIs
- `GET /api/vote/[token]` - Get voting data (voter info + candidates)
- `POST /api/vote/[token]/submit` - Submit vote
- `GET /api/vote/[token]/status` - Get voter status

### Monitoring APIs
- `GET /api/monitoring/realtime` - Real-time statistics

## 🎨 Tampilan

### Homepage
- Landing page dengan informasi aplikasi
- Link ke admin panel dan monitoring

### Admin Panel
- Dashboard dengan statistik
- Manajemen data pemilih
- Verifikasi dan generate URL
- Pengaturan sistem

### Voting Page
- Profil 3 kandidat dengan visi misi
- Interface voting yang user-friendly
- Halaman terima kasih setelah voting

### Monitoring
- Real-time dashboard dengan grafik
- Auto-refresh setiap 5 detik
- Statistik lengkap dan trend voting

## 🚀 Production Deployment

1. **Build Aplikasi**
   ```bash
   npm run build
   ```

2. **Set Environment Variables**
   ```env
   DATABASE_URL="file:./prod.db"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="your-production-secret"
   ```

3. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 License

Aplikasi ini dibuat khusus untuk SMK Negeri 2 Malinau.

## 📞 Support

Untuk bantuan teknis atau pertanyaan, silakan hubungi:
- Email: admin@smkn2malinau.sch.id
- Phone: +62xxx-xxxx-xxxx

---

**© 2025 SMK Negeri 2 Malinau - Sistem E-Voting Pemilihan Ketua OSIS**
# e-vote
