# Panduan Penggunaan Halaman Master Data Admin

## Akses Halaman
Halaman Master Data dapat diakses melalui:
1. Login sebagai ADMIN
2. Dari Dashboard Admin, klik tombol **"📊 Master Data"**
3. URL: `/admin/master-data`

## Fitur Utama

### 1. 🔧 Tab Sparepart (Pergantian Barang)
Mengelola data sparepart/komponen pengganti untuk HP.

**Field yang diperlukan:**
- **Nama Sparepart**: Nama komponen (contoh: "LCD iPhone 14 Pro")
- **Harga**: Harga sparepart dalam Rupiah (contoh: 150000)

**Fungsi:**
- ✅ Tambah sparepart baru
- ✅ Edit data sparepart
- ✅ Hapus sparepart (jika belum digunakan oleh kendala)

---

### 2. ⚠️ Tab Kendala HP
Mengelola jenis-jenis kendala/masalah HP dan sparepart yang dibutuhkan.

**Field yang diperlukan:**
- **Topik Masalah**: Jenis masalah (contoh: "LCD Rusak", "Baterai Lemah")
- **Sparepart Pengganti**: Pilih dari dropdown sparepart yang sudah dibuat

**Relasi:**
- Setiap kendala terhubung dengan 1 sparepart
- 1 sparepart hanya bisa digunakan oleh 1 kendala (relasi one-to-one)

**Fungsi:**
- ✅ Tambah kendala baru
- ✅ Edit kendala
- ✅ Hapus kendala (jika belum digunakan oleh handphone)

---

### 3. 📱 Tab Handphone
Mengelola kombinasi Brand HP, Tipe HP, dan Kendala yang bisa ditangani.

**Field yang diperlukan:**
- **Brand HP**: Merek HP (contoh: "iPhone", "Samsung", "Xiaomi")
- **Tipe HP**: Model HP (contoh: "14 Pro Max", "Galaxy S23")
- **Kendala Handphone**: Pilih dari dropdown kendala yang sudah dibuat

**Relasi:**
- Setiap handphone entry merepresentasikan kombinasi Brand + Tipe + Kendala
- Satu tipe HP bisa punya banyak entry untuk berbagai kendala

**Contoh Data:**
```
Brand: iPhone | Tipe: 14 Pro | Kendala: LCD Rusak
Brand: iPhone | Tipe: 14 Pro | Kendala: Baterai Lemah
Brand: Samsung | Tipe: Galaxy S23 | Kendala: LCD Rusak
```

**Fungsi:**
- ✅ Tambah handphone baru
- ✅ Edit data handphone
- ✅ Hapus handphone (jika belum digunakan oleh service booking)

---

### 4. ⏰ Tab Waktu/Shift
Mengelola jadwal shift untuk booking service.

**Field yang diperlukan:**
- **Nama Shift**: Nama shift (contoh: "Shift 1", "Shift Pagi")
- **Jam Mulai**: Waktu mulai (format HH:MM, contoh: 08:00)
- **Jam Selesai**: Waktu selesai (format HH:MM, contoh: 12:00)
- **Tersedia untuk booking**: Checkbox untuk mengaktifkan/menonaktifkan shift

**Validasi:**
- Jam mulai harus lebih awal dari jam selesai
- Tidak boleh ada overlap waktu antar shift
- Nama shift harus unik

**Fungsi:**
- ✅ Tambah shift baru
- ✅ Edit shift
- ✅ Hapus shift (jika belum digunakan oleh service booking)
- ✅ Toggle ketersediaan shift

---

## Alur Kerja Penggunaan

### Urutan Input Data (Untuk Setup Awal):
1. **Pertama**: Input **Sparepart** terlebih dahulu
2. **Kedua**: Input **Kendala HP** (memerlukan sparepart)
3. **Ketiga**: Input **Handphone** (memerlukan kendala)
4. **Keempat**: Input **Waktu/Shift**

### Contoh Setup Lengkap:

#### Step 1: Tambah Sparepart
```
Nama: LCD iPhone 14 Pro
Harga: 2500000
```

#### Step 2: Tambah Kendala
```
Topik Masalah: LCD Rusak
Sparepart Pengganti: LCD iPhone 14 Pro
```

#### Step 3: Tambah Handphone
```
Brand: iPhone
Tipe: 14 Pro
Kendala: LCD Rusak
```

#### Step 4: Tambah Waktu
```
Nama Shift: Shift 1
Jam Mulai: 08:00
Jam Selesai: 12:00
Tersedia: ✓
```

---

## Catatan Penting

### Dependency & Constraints:
- ❌ Tidak bisa hapus **Sparepart** jika sudah digunakan oleh **Kendala**
- ❌ Tidak bisa hapus **Kendala** jika sudah digunakan oleh **Handphone**
- ❌ Tidak bisa hapus **Handphone** jika sudah digunakan oleh **Service Booking**
- ❌ Tidak bisa hapus **Waktu** jika sudah digunakan oleh **Service Booking**

### Duplicate Prevention:
- Nama Sparepart harus unik (case-insensitive)
- Topik Masalah kendala harus unik
- Kombinasi Brand + Tipe + Kendala harus unik untuk Handphone
- Nama Shift harus unik
- Tidak boleh ada overlap waktu shift

---

## Fitur UI

### Tampilan:
- 🎨 Modern glassmorphism design
- 📱 Responsive layout
- 🌙 Dark theme dengan gradient background
- ✨ Smooth transitions dan hover effects

### Modal Form:
- Input validation real-time
- Dropdown untuk relasi data
- Auto-close setelah submit sukses
- Error handling dengan alert messages

### Table:
- Sortable columns
- Hover highlight
- Action buttons (Edit & Hapus)
- Color-coded status (untuk Waktu)

---

## API Endpoints yang Digunakan

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/pergantian-barang` | GET | Ambil semua sparepart |
| `/api/pergantian-barang` | POST | Tambah sparepart |
| `/api/pergantian-barang` | PUT | Update sparepart |
| `/api/pergantian-barang?id={id}` | DELETE | Hapus sparepart |
| `/api/kendala-handphone` | GET | Ambil semua kendala |
| `/api/kendala-handphone` | POST | Tambah kendala |
| `/api/kendala-handphone` | PUT | Update kendala |
| `/api/kendala-handphone?id={id}` | DELETE | Hapus kendala |
| `/api/handphone` | GET | Ambil semua handphone |
| `/api/handphone` | POST | Tambah handphone |
| `/api/handphone` | PUT | Update handphone |
| `/api/handphone?id={id}` | DELETE | Hapus handphone |
| `/api/waktu` | GET | Ambil semua waktu |
| `/api/waktu` | POST | Tambah waktu |
| `/api/waktu` | PUT | Update waktu |
| `/api/waktu?id={id}` | DELETE | Hapus waktu |

---

## Troubleshooting

### Error: "Cannot delete X. It is being used by Y"
**Solusi**: Hapus terlebih dahulu data Y yang menggunakan X, atau edit Y untuk menggunakan data lain.

### Error: "X sudah ada"
**Solusi**: Data dengan nama yang sama sudah ada. Gunakan nama yang berbeda atau edit data yang sudah ada.

### Error: "Pergantian barang sudah digunakan oleh kendala handphone lain"
**Solusi**: Satu sparepart hanya bisa digunakan oleh satu kendala. Buat sparepart baru atau edit kendala yang sudah ada.

### Error: "Jam shift overlap"
**Solusi**: Pastikan waktu shift tidak bertumpuk dengan shift lain yang sudah ada.

---

## Keamanan

- ✅ Hanya user dengan role **ADMIN** yang bisa akses halaman ini
- ✅ Middleware akan redirect user biasa ke `/booking`
- ✅ Setiap API request memerlukan JWT authentication token
- ✅ Token disimpan di HTTP-only cookie untuk keamanan

---

**Dibuat untuk**: Bukhari Service Center Management System
**Lokasi File**: `src/app/admin/master-data/page.tsx`

