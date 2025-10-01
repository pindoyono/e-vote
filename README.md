# E-Vote OSIS SMK N 2 MALINAU

Aplikasi pemilihan ketua OSIS berbasis web menggunakan Next.js dengan fitur-fitur lengkap untuk manajemen pemilihan elektronik.

## Fitur Utama

### 🔐 Sistem Autentikasi
- Login untuk admin dan panitia
- Role-based access control
- Session management dengan cookies

### 👥 Manajemen Data Pemilih
- Input data pemilih manual
- Import/export data pemilih (Excel/CSV)
- Validasi dan verifikasi data
- Tracking status voting

### 🗳️ Sistem Pemilihan
- Verifikasi pemilih oleh panitia
- Generate URL voting unik per pemilih
- Interface voting dengan 3 kandidat
- One-time voting token
- Halaman konfirmasi setelah voting

### 📊 Dashboard Real-time
- Monitoring hasil voting secara real-time
- Statistik partisipasi pemilih
- Grafik perolehan suara
- Activity log

### 👤 Manajemen Kandidat
- Profil lengkap kandidat (nama, kelas, visi, misi)
- Upload foto kandidat
- Tampilan kandidat yang menarik

## Teknologi yang Digunakan

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite dengan Prisma ORM
- **Authentication**: Custom JWT-based auth
- **UI Components**: Custom components + Radix UI
- **File Processing**: xlsx, papaparse untuk import/export

## Instalasi dan Setup

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Langkah Instalasi

1. **Clone atau download project**
   ```bash
   cd /var/www/e-vote
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Seed database dengan data sample**
   ```bash
   npm run db:seed
   ```

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

6. **Buka aplikasi di browser**
   ```
   http://localhost:3000
   ```

## Kredensial Default

### Admin
- Username: `admin`
- Password: `admin123`

### Panitia
- Username: `committee`
- Password: `committee123`

## Struktur Project

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Data seeding
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── candidates/   # Candidates management
│   │   │   ├── voters/       # Voters management
│   │   │   ├── vote/         # Voting endpoints
│   │   │   └── dashboard/    # Dashboard statistics
│   │   ├── login/            # Login page
│   │   └── page.tsx          # Home page (redirect to login)
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── lib/
│       ├── prisma.ts         # Database client
│       └── auth.ts           # Authentication utilities
├── .env                      # Environment variables
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Voters Management
- `GET /api/voters` - Get all voters
- `POST /api/voters` - Add new voter
- `POST /api/voters/[id]/generate-token` - Generate voting token

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Add new candidate

### Voting
- `POST /api/vote` - Submit vote
- `GET /api/vote/verify/[token]` - Verify voting token

### Dashboard
- `GET /api/dashboard/stats` - Get voting statistics

## Database Schema

### Users
- Admin dan panitia dengan role-based access

### Voters
- Data pemilih (NIS, nama, kelas)
- Status voting dan token management

### Candidates
- Data kandidat (nama, kelas, visi, misi, foto)
- Nomor urut kandidat

### Votes
- Record voting dengan relasi ke voter dan candidate
- Timestamp voting

## Fitur Keamanan

1. **Token-based Authentication**
   - JWT tokens untuk session management
   - HttpOnly cookies untuk keamanan

2. **One-time Voting**
   - Setiap pemilih hanya bisa vote sekali
   - Token voting yang expire setelah digunakan

3. **Role-based Access**
   - Admin: Full access ke semua fitur
   - Committee: Access untuk verifikasi dan monitoring

4. **Data Validation**
   - Server-side validation untuk semua input
   - Sanitization untuk mencegah injection

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset and reseed database

# Production
npm run build            # Build for production
npm start               # Start production server
```

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
APP_NAME="E-Vote OSIS SMK N 2 MALINAU"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

## Roadmap dan Pengembangan Selanjutnya

### Fitur yang akan ditambahkan:
1. **Admin Panel Lengkap**
   - Dashboard admin untuk manajemen user
   - Bulk import/export voters
   - Manajemen kandidat dengan upload foto

2. **Committee Panel**
   - Interface verifikasi pemilih
   - Generate dan kirim link voting
   - Monitor voting progress

3. **Voting Interface**
   - Halaman voting yang responsive
   - Tampilan kandidat yang menarik
   - Konfirmasi voting

4. **Real-time Dashboard**
   - WebSocket integration untuk real-time updates
   - Charts dan visualisasi data
   - Export hasil voting

5. **Security Enhancements**
   - Rate limiting
   - CSRF protection
   - Advanced logging

## Kontribusi

Project ini dikembangkan untuk SMK N 2 MALINAU. Untuk kontribusi atau pertanyaan, silakan hubungi tim pengembang.

## Lisensi

Copyright © 2025 SMK N 2 MALINAU. All rights reserved.
# e-vote
