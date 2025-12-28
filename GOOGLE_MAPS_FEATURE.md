# Fitur Google Maps Link

## Deskripsi
Fitur ini memungkinkan pelanggan untuk menambahkan link Google Maps ke lokasi mereka saat membuat pemesanan layanan dengan opsi "Mekanik datang ke lokasi Anda". Link ini akan ditampilkan di halaman tracking dan history, memudahkan mekanik untuk menemukan lokasi pelanggan.

## Cara Menggunakan

### 1. Untuk Pelanggan (Saat Booking)

**Langkah-langkah:**

1. Buka halaman **Booking** (`/booking`)
2. Pilih perangkat dan masalah di Step 1 & 2
3. Pilih jadwal di Step 3
4. Di **Step 4 (Jenis Layanan)**, pilih **"Mekanik datang ke lokasi Anda"**
5. Isi **Alamat Lengkap** (wajib)
6. Opsional: Tambahkan **Link Google Maps** untuk lokasi Anda

**Cara mendapatkan link Google Maps:**
- Buka Google Maps di browser atau aplikasi
- Cari atau pilih lokasi Anda
- Klik tombol "Share" atau "Bagikan"
- Salin link yang diberikan
- Contoh format: `https://maps.google.com/?q=5.5488405,95.3238525` atau `https://goo.gl/maps/xxxxx`

7. Konfirmasi pemesanan di Step 5
8. Submit pemesanan

### 2. Melihat Link Google Maps

**Di Halaman Tracking:**
- Buka halaman **Tracking** (`/tracking`)
- Pilih pesanan yang ingin dilacak
- Link Google Maps akan ditampilkan di bagian "Lokasi" (jika tersedia)
- Klik tombol **"Buka di Google Maps"** untuk membuka lokasi di tab baru

**Di Halaman History:**
- Buka halaman **History** (`/history`)
- Di daftar pesanan, link Google Maps ditampilkan dengan tombol **"Buka"**
- Di detail pesanan (klik "Lihat Detail"), klik tombol **"Buka di Google Maps"**

### 3. Untuk Mekanik/Admin

Mekanik atau admin dapat melihat link Google Maps dari pesanan pelanggan melalui:
- Dashboard admin
- Detail pesanan
- Klik link untuk langsung membuka Google Maps dan mendapatkan navigasi ke lokasi

## Implementasi Teknis

### Database Schema
Field baru ditambahkan ke model `Service`:
```prisma
model Service {
  // ... field lainnya
  googleMapsLink   String?  // Link Google Maps (opsional)
}
```

### Migration
Migration sudah dibuat: `20251228024430_add_google_maps_link_to_service`

### API Endpoints yang Diupdate
1. **POST /api/service** - Menerima field `googleMapsLink`
2. **GET /api/service/getMyTracking** - Mengembalikan field `googleMapsLink`
3. **GET /api/service/getMyHistory** - Mengembalikan field `googleMapsLink`

### Frontend Components yang Diupdate
1. **Booking Page** (`src/app/booking/page.tsx`)
   - Step 4: Input field untuk Google Maps link
   - Step 5: Preview link Google Maps di konfirmasi
   
2. **Tracking Page** (`src/app/tracking/page.tsx`)
   - Menampilkan link Google Maps yang dapat diklik
   
3. **History Page** (`src/app/history/page.tsx`)
   - Menampilkan link Google Maps di daftar dan detail pesanan

## Validasi
- Field `googleMapsLink` bersifat **opsional** (tidak wajib diisi)
- Tipe input: `url` untuk validasi format link
- Tidak ada validasi spesifik untuk format Google Maps - menerima berbagai format link

## UI/UX
- Button dengan icon lokasi (pin marker) untuk identifikasi visual
- Warna biru untuk konsistensi dengan tema aplikasi
- Hover effect untuk interaktivitas
- Opens in new tab (`target="_blank"`) agar tidak mengganggu flow aplikasi
- `rel="noopener noreferrer"` untuk keamanan

## Keuntungan
1. **Untuk Pelanggan:**
   - Mudah memberikan lokasi yang akurat
   - Tidak perlu menjelaskan alamat secara detail

2. **Untuk Mekanik:**
   - Navigasi langsung ke lokasi pelanggan
   - Mengurangi kesalahan dalam menemukan lokasi
   - Hemat waktu

3. **Untuk Bisnis:**
   - Meningkatkan efisiensi layanan
   - Mengurangi komplain terkait lokasi
   - Pengalaman pelanggan yang lebih baik
