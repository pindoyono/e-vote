# Theme Configuration Guide

## Penggunaan Tema di Aplikasi E-Vote

Sistem tema menggunakan CSS Variables yang dapat dikonfigurasi melalui halaman Admin → Settings.

### Variabel CSS Tersedia

```css
--color-primary: #1e40af    /* Warna utama (biru tua) */
--color-secondary: #3b82f6  /* Warna sekunder (biru cerah) */
--color-accent: #eab308     /* Warna aksen (kuning) */
--color-success: #16a34a    /* Warna sukses (hijau) */
```

### Cara Menggunakan di Komponen

#### 1. Menggunakan Inline Style
```tsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Ini menggunakan warna primary
</div>
```

#### 2. Menggunakan Tailwind dengan arbitrary values
```tsx
<div className="bg-[var(--color-primary)] text-white">
  Ini menggunakan warna primary dengan Tailwind
</div>
```

#### 3. Menggunakan di CSS/SCSS
```css
.my-button {
  background-color: var(--color-primary);
  border: 2px solid var(--color-secondary);
}

.my-button:hover {
  background-color: var(--color-accent);
}
```

### Contoh Implementasi

#### Button dengan tema dinamis
```tsx
<button 
  className="px-6 py-3 rounded-lg text-white font-semibold"
  style={{ backgroundColor: 'var(--color-primary)' }}
>
  Tombol Primary
</button>
```

#### Gradient dengan tema
```tsx
<div 
  className="min-h-screen p-8"
  style={{
    background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))`
  }}
>
  Background Gradient
</div>
```

#### Card dengan border tema
```tsx
<div 
  className="p-6 rounded-lg border-2"
  style={{ borderColor: 'var(--color-accent)' }}
>
  Card dengan border accent
</div>
```

### Komponen yang Sudah Menggunakan Tema

Saat ini, tema dapat dikonfigurasi di halaman Admin → Settings → Konfigurasi Tema Warna.

Untuk mengimplementasikan tema ke komponen yang sudah ada:

1. Ganti hardcoded colors (seperti `bg-blue-600`) dengan CSS variables
2. Gunakan inline style atau Tailwind arbitrary values
3. Perubahan akan terlihat setelah refresh halaman

### Contoh Migrasi dari Hardcoded ke Theme

**Sebelum:**
```tsx
<div className="bg-blue-600 hover:bg-blue-700">
  Button
</div>
```

**Sesudah:**
```tsx
<div 
  className="hover:opacity-90 transition-opacity"
  style={{ backgroundColor: 'var(--color-primary)' }}
>
  Button
</div>
```

### Preset Warna yang Disarankan

#### Tema Biru (Default)
- Primary: `#1e40af` (blue-800)
- Secondary: `#3b82f6` (blue-500)
- Accent: `#eab308` (yellow-500)
- Success: `#16a34a` (green-600)

#### Tema Merah
- Primary: `#991b1b` (red-800)
- Secondary: `#ef4444` (red-500)
- Accent: `#f59e0b` (amber-500)
- Success: `#16a34a` (green-600)

#### Tema Hijau
- Primary: `#065f46` (green-800)
- Secondary: `#10b981` (green-500)
- Accent: `#fbbf24` (yellow-400)
- Success: `#3b82f6` (blue-500)

#### Tema Ungu
- Primary: `#6b21a8` (purple-800)
- Secondary: `#a855f7` (purple-500)
- Accent: `#ec4899` (pink-500)
- Success: `#10b981` (green-500)

### Catatan Penting

1. **Refresh Required**: Setelah menyimpan tema baru, refresh halaman untuk melihat perubahan
2. **Compatibility**: Pastikan warna memiliki kontras yang cukup untuk aksesibilitas
3. **Testing**: Tes tema pada berbagai halaman (voting, admin, committee)
4. **Backup**: Catat kombinasi warna yang berhasil sebelum mengubah tema
