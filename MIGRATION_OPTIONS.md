# ⚠️ Migration Issue - Data Existing Terdeteksi

## 🔍 Problem

Ada data existing di database:
- **KendalaHandphone**: 1 record
- **PergantianBarang**: 7 records

Schema baru memerlukan foreign key yang tidak ada di data lama:
- `KendalaHandphone` perlu `handphoneId`
- `PergantianBarang` perlu `kendalaHandphoneId`

---

## 💡 Pilihan Solusi

### Option 1: Reset Database (RECOMMENDED untuk Development)
✅ **Tercepat & Paling Mudah**
❌ **Semua data akan hilang**

**Kapan gunakan:**
- Masih dalam fase development
- Data existing hanya untuk testing
- Tidak ada data production penting

**Command:**
```bash
# Reset database dan apply migration baru
npx prisma migrate reset

# Akan melakukan:
# 1. Drop semua tabel
# 2. Recreate database
# 3. Apply semua migration
# 4. Run seed (jika ada)
```

---

### Option 2: Manual Data Migration
✅ **Data lama tetap ada (jika bisa dimapping)**
❌ **Lebih kompleks**

**Kapan gunakan:**
- Ada data production yang penting
- Perlu preserve data existing

**Steps:**
1. Export data existing
2. Create migration file manual
3. Transform data sesuai struktur baru
4. Apply migration

**Command:**
```bash
# 1. Create migration file (tanpa apply)
npx prisma migrate dev --create-only --name restructure_relationships

# 2. Edit file migration di prisma/migrations/
# 3. Tambahkan SQL untuk migrate data
# 4. Apply migration
npx prisma migrate dev
```

---

### Option 3: Drop Data & Fresh Start
✅ **Bersih & Fresh**
❌ **Data hilang tapi struktur lama masih ada sebentar**

**Command:**
```bash
# Hapus data manual via Prisma Studio
npx prisma studio

# Di Prisma Studio:
# 1. Delete all records di Service
# 2. Delete all records di Handphone
# 3. Delete all records di KendalaHandphone  
# 4. Delete all records di PergantianBarang

# Setelah data kosong, run migration
npx prisma migrate dev --name restructure_relationships
```

---

## 🎯 Recommended Action (untuk Development)

### Langkah yang Saya Rekomendasikan:

```bash
# Step 1: Backup database (optional, untuk jaga-jaga)
pg_dump -U postgres bukhari > backup_$(date +%Y%m%d).sql

# Step 2: Reset database dengan struktur baru
npx prisma migrate reset

# Step 3: Generate Prisma Client
npx prisma generate

# Step 4: Verify dengan Prisma Studio
npx prisma studio
```

**Result:**
- ✅ Database bersih dengan struktur baru
- ✅ Siap untuk input data dengan alur yang benar
- ✅ Tidak ada konflik data lama

---

## 📊 Current Data Status

Berdasarkan test sebelumnya:
```
Users: 8 records ← Akan tetap ada (tidak terpengaruh)
PergantianBarang: 7 records ← Akan dihapus
KendalaHandphone: 1 record ← Akan dihapus
Handphone: 1 record ← Akan dihapus
Waktu: 3 records ← Akan tetap ada (tidak terpengaruh)
Service: 2 records ← Akan dihapus (tergantung Handphone)
```

**⚠️ Yang Akan Hilang dengan Option 1:**
- Data Handphone (1 record)
- Data Kendala (1 record)
- Data Sparepart (7 records)
- Data Service booking (2 records)

**✅ Yang Tetap Ada:**
- User accounts (8 records) - AMAN
- Waktu/Shift (3 records) - AMAN

---

## 🚀 Quick Start (Jika Pilih Reset)

Jalankan command ini untuk reset & setup ulang:

```bash
# All-in-one command
npx prisma migrate reset && npx prisma generate && npx prisma studio
```

Setelah reset:
1. Prisma Studio akan terbuka
2. Tabel masih ada tapi kosong
3. Struktur sudah sesuai schema baru
4. Siap input data dengan alur baru:
   - Handphone → Kendala → Sparepart

---

## 🔄 New Data Input Flow

Setelah migration berhasil:

### 1. Input Handphone (Tab pertama)
```
Brand: iPhone
Tipe: 14 Pro
[Simpan] → Handphone ID dibuat
```

### 2. Input Kendala (Tab kedua)
```
Handphone: [Pilih iPhone 14 Pro dari dropdown]
Topik Masalah: LCD Rusak
[Simpan] → Kendala ID dibuat
```

### 3. Input Sparepart (Tab ketiga)
```
Kendala: [Pilih "LCD Rusak - iPhone 14 Pro" dari dropdown]
Nama Barang: LCD iPhone 14 Pro Original
Harga: 2500000
[Simpan] → Sparepart ID dibuat
```

### 4. Input Sparepart Alternatif (opsional)
```
Kendala: [Pilih "LCD Rusak - iPhone 14 Pro" dari dropdown]
Nama Barang: LCD iPhone 14 Pro OEM
Harga: 1800000
[Simpan] → Sparepart ID dibuat
```

Sekarang customer punya 2 pilihan untuk "LCD Rusak iPhone 14 Pro":
- Original (Rp 2.500.000)
- OEM (Rp 1.800.000)

---

## ❓ Mana yang Harus Dipilih?

### Pilih Option 1 (Reset) jika:
- ✅ Masih development/testing
- ✅ Data existing tidak penting
- ✅ Ingin cepat & mudah

### Pilih Option 2 (Manual Migration) jika:
- ✅ Ada data production penting
- ✅ Ingin preserve data lama
- ✅ Bersedia coding SQL manual

### Pilih Option 3 (Delete Manual) jika:
- ✅ Ingin control penuh
- ✅ Ingin lihat data sebelum dihapus
- ✅ Ingin selective delete

---

## 🎯 My Recommendation

Karena Anda masih dalam tahap development dan:
- User accounts akan tetap aman
- Data master (Handphone, Kendala, Sparepart) hanya 9 records total
- Service booking hanya 2 records test

**Saya rekomendasikan: Option 1 (Reset)**

Setelah reset, Anda bisa:
1. Input ulang master data dengan struktur yang benar
2. Test fitur Master Data page dengan alur baru
3. Buat data lebih terstruktur

---

**Apakah Anda ingin saya jalankan reset sekarang?**

Jika ya, saya akan menjalankan:
```bash
npx prisma migrate reset
```

Jika tidak, saya bisa bantu dengan opsi lain atau buat migration manual.

