# 🚀 Cara Menggunakan Halaman Master Data

## Akses Halaman

### Langkah 1: Login sebagai Admin
1. Buka aplikasi Bukhari Service Center
2. Login menggunakan akun dengan role **ADMIN**
3. Setelah login, Anda akan diarahkan ke `/admin`

### Langkah 2: Buka Halaman Master Data
1. Di Dashboard Admin, cari tombol **"📊 Master Data"** di header kanan atas
2. Klik tombol tersebut
3. Anda akan diarahkan ke halaman Master Data Management

**Alternatif**: Akses langsung melalui URL: `http://localhost:3000/admin/master-data`

---

## 📝 Setup Data Awal (Untuk Pertama Kali)

### Step 1: Tambah Sparepart Dulu

1. Pastikan tab **"🔧 Sparepart"** aktif (warna biru)
2. Klik tombol **"+ Tambah Data Baru"**
3. Isi form:
   - **Nama Sparepart**: `LCD iPhone 14 Pro`
   - **Harga**: `2500000`
4. Klik **"Simpan"**
5. Ulangi untuk sparepart lainnya

**Contoh Data Sparepart:**
```
- LCD iPhone 14 Pro → Rp 2.500.000
- Baterai Samsung S23 → Rp 850.000
- Kamera Xiaomi Redmi Note 12 → Rp 450.000
- Speaker iPhone 13 → Rp 350.000
- Touchscreen Oppo A57 → Rp 750.000
```

---

### Step 2: Tambah Kendala Handphone

1. Klik tab **"⚠️ Kendala HP"**
2. Klik tombol **"+ Tambah Data Baru"**
3. Isi form:
   - **Topik Masalah**: `LCD Rusak`
   - **Sparepart Pengganti**: Pilih `LCD iPhone 14 Pro` dari dropdown
4. Klik **"Simpan"**
5. Ulangi untuk kendala lainnya

**Contoh Data Kendala:**
```
- LCD Rusak → Sparepart: LCD iPhone 14 Pro
- Baterai Lemah → Sparepart: Baterai Samsung S23
- Kamera Tidak Berfungsi → Sparepart: Kamera Xiaomi Redmi Note 12
- Speaker Mati → Sparepart: Speaker iPhone 13
- Touchscreen Tidak Responsif → Sparepart: Touchscreen Oppo A57
```

**⚠️ Catatan Penting:**
- Satu sparepart hanya bisa digunakan untuk satu kendala
- Jika sparepart sudah digunakan, buat sparepart baru dulu

---

### Step 3: Tambah Data Handphone

1. Klik tab **"📱 Handphone"**
2. Klik tombol **"+ Tambah Data Baru"**
3. Isi form:
   - **Brand HP**: `iPhone`
   - **Tipe HP**: `14 Pro`
   - **Kendala Handphone**: Pilih `LCD Rusak` dari dropdown
4. Klik **"Simpan"**
5. Ulangi untuk kombinasi lainnya

**Contoh Data Handphone:**
```
Brand: iPhone    | Tipe: 14 Pro       | Kendala: LCD Rusak
Brand: iPhone    | Tipe: 13           | Kendala: Speaker Mati
Brand: Samsung   | Tipe: Galaxy S23   | Kendala: Baterai Lemah
Brand: Xiaomi    | Tipe: Redmi Note 12| Kendala: Kamera Tidak Berfungsi
Brand: Oppo      | Tipe: A57          | Kendala: Touchscreen Tidak Responsif
```

**💡 Tips:**
- Satu tipe HP bisa punya banyak entry untuk berbagai masalah
- Misal: iPhone 14 Pro bisa ada entry untuk LCD Rusak, Baterai Lemah, dll

---

### Step 4: Tambah Waktu/Shift

1. Klik tab **"⏰ Waktu/Shift"**
2. Klik tombol **"+ Tambah Data Baru"**
3. Isi form:
   - **Nama Shift**: `Shift 1`
   - **Jam Mulai**: `08:00`
   - **Jam Selesai**: `12:00`
   - **Tersedia untuk booking**: ✅ (centang)
4. Klik **"Simpan"**
5. Ulangi untuk shift lainnya

**Contoh Data Shift:**
```
Shift 1 → 08:00 - 12:00 (Tersedia)
Shift 2 → 13:00 - 17:00 (Tersedia)
Shift 3 → 18:00 - 21:00 (Tersedia)
```

**⚠️ Validasi:**
- Jam mulai harus lebih awal dari jam selesai
- Tidak boleh ada overlap waktu antar shift
- Format: HH:MM (24 jam)

---

## ✏️ Edit Data

### Cara Edit:
1. Pilih tab yang sesuai (Sparepart/Kendala/Handphone/Waktu)
2. Cari data yang ingin diedit di tabel
3. Klik tombol **"Edit"** (biru)
4. Form akan muncul dengan data yang sudah terisi
5. Ubah field yang diinginkan
6. Klik **"Simpan"**

**Contoh: Mengganti Harga Sparepart**
1. Tab Sparepart
2. Cari "LCD iPhone 14 Pro"
3. Klik "Edit"
4. Ubah harga dari `2500000` menjadi `2800000`
5. Klik "Simpan"

---

## 🗑️ Hapus Data

### Cara Hapus:
1. Pilih tab yang sesuai
2. Cari data yang ingin dihapus
3. Klik tombol **"Hapus"** (merah)
4. Konfirmasi dengan klik "OK" di popup

### ⚠️ Perhatian - Tidak Bisa Hapus Jika:
- **Sparepart** → digunakan oleh Kendala
- **Kendala** → digunakan oleh Handphone
- **Handphone** → digunakan oleh Service Booking
- **Waktu** → digunakan oleh Service Booking

### Solusi Jika Tidak Bisa Hapus:
1. Hapus/ubah data yang menggunakan data ini terlebih dahulu
2. Atau edit data ini untuk mengubah informasinya

---

## 🎯 Skenario Penggunaan

### Skenario 1: Menambah HP Baru yang Dilayani
**Situasi**: Service center sekarang melayani Oppo A77

**Langkah:**
1. Buat Sparepart untuk komponen Oppo A77 (jika belum ada)
2. Buat Kendala yang umum (jika belum ada)
3. Tab Handphone → Tambah Data:
   - Brand: `Oppo`
   - Tipe: `A77`
   - Kendala: Pilih kendala yang sesuai

---

### Skenario 2: Update Harga Sparepart
**Situasi**: Harga LCD iPhone 14 Pro naik

**Langkah:**
1. Tab Sparepart
2. Cari "LCD iPhone 14 Pro"
3. Klik "Edit"
4. Update harga
5. Simpan
6. ✅ Otomatis semua kendala & handphone yang terkait akan menunjukkan harga baru

---

### Skenario 3: Menonaktifkan Shift Sementara
**Situasi**: Shift 3 tidak tersedia hari ini

**Langkah:**
1. Tab Waktu/Shift
2. Cari "Shift 3"
3. Klik "Edit"
4. Hilangkan centang pada "Tersedia untuk booking"
5. Simpan
6. ✅ Customer tidak akan bisa booking di Shift 3

---

### Skenario 4: Menghapus Kendala yang Salah Input
**Situasi**: Salah input kendala "Layar Pecah" (harusnya "LCD Rusak")

**Langkah:**
1. Pastikan kendala ini belum digunakan di Handphone
2. Tab Kendala HP
3. Cari "Layar Pecah"
4. Klik "Hapus"
5. Konfirmasi
6. Buat kendala baru dengan nama yang benar

---

## 🔍 Tips & Trik

### ✅ DO (Lakukan):
- Input data Sparepart dulu sebelum yang lain
- Gunakan nama yang konsisten (misal: "iPhone" bukan "Iphone" atau "iphone")
- Cek harga sparepart secara berkala dan update jika ada perubahan
- Nonaktifkan shift yang tidak tersedia daripada menghapusnya
- Buat data handphone untuk setiap kombinasi brand + tipe + masalah yang dilayani

### ❌ DON'T (Jangan):
- Jangan hapus data yang sudah digunakan (akan error)
- Jangan gunakan nama yang ambiguous (misal: "LCD" saja, kurang jelas)
- Jangan buat sparepart duplikat dengan nama berbeda untuk barang sama
- Jangan buat shift yang overlap
- Jangan lupa centang "Tersedia" saat membuat shift baru

---

## 🆘 Troubleshooting

### Masalah: "Cannot delete X. It is being used by Y"
**Artinya**: Data ini masih digunakan oleh data lain
**Solusi**: 
- Lihat data mana yang menggunakan ini
- Hapus atau ubah data tersebut terlebih dahulu

---

### Masalah: "X sudah ada"
**Artinya**: Data dengan nama yang sama sudah ada
**Solusi**: 
- Gunakan nama yang berbeda
- Atau edit data yang sudah ada

---

### Masalah: "Pergantian barang sudah digunakan"
**Artinya**: Sparepart ini sudah dipasangkan dengan kendala lain
**Solusi**: 
- Buat sparepart baru (boleh nama sama tapi ID berbeda)
- Atau ubah kendala yang lama untuk melepas sparepart ini

---

### Masalah: Form tidak bisa submit
**Solusi**:
- Pastikan semua field required terisi
- Cek format input (harga harus angka, waktu format HH:MM)
- Lihat pesan error di alert

---

### Masalah: Data tidak muncul setelah ditambah
**Solusi**:
- Refresh halaman (F5)
- Cek di tab yang benar
- Cek koneksi internet
- Lihat console browser untuk error

---

## 📊 Contoh Data Lengkap untuk Testing

```javascript
// SPAREPART (Input pertama)
[
  { nama: "LCD iPhone 14 Pro", harga: 2500000 },
  { nama: "LCD Samsung S23", harga: 1800000 },
  { nama: "Baterai iPhone 13", harga: 850000 },
  { nama: "Speaker Xiaomi Note 12", harga: 350000 }
]

// KENDALA HP (Input kedua)
[
  { topik: "LCD Rusak", sparepart: "LCD iPhone 14 Pro" },
  { topik: "LCD Pecah", sparepart: "LCD Samsung S23" },
  { topik: "Baterai Lemah", sparepart: "Baterai iPhone 13" },
  { topik: "Speaker Mati", sparepart: "Speaker Xiaomi Note 12" }
]

// HANDPHONE (Input ketiga)
[
  { brand: "iPhone", tipe: "14 Pro", kendala: "LCD Rusak" },
  { brand: "iPhone", tipe: "13", kendala: "Baterai Lemah" },
  { brand: "Samsung", tipe: "Galaxy S23", kendala: "LCD Pecah" },
  { brand: "Xiaomi", tipe: "Redmi Note 12", kendala: "Speaker Mati" }
]

// WAKTU (Input keempat)
[
  { shift: "Shift 1", mulai: "08:00", selesai: "12:00", tersedia: true },
  { shift: "Shift 2", mulai: "13:00", selesai: "17:00", tersedia: true },
  { shift: "Shift 3", mulai: "18:00", selesai: "21:00", tersedia: true }
]
```

---

## 🎓 Video Tutorial (Coming Soon)

Untuk tutorial video, silakan hubungi tim development.

---

## 📞 Butuh Bantuan?

Jika mengalami kendala:
1. Baca dokumentasi lengkap di `MASTER_DATA_GUIDE.md`
2. Cek technical documentation di `DATABASE_SCHEMA_GUIDE.md`
3. Hubungi tim IT/Developer

---

**Selamat Menggunakan! 🎉**

Halaman Master Data ini akan sangat membantu dalam mengelola data service center dengan lebih terorganisir dan efisien.

