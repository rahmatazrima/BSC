# AUTO-GENERATE FITUR - HANDPHONE, KENDALA & SPAREPART

## 📋 Ringkasan Fitur

Sistem ini telah diupdate dengan fitur **Auto-Generate** yang memudahkan admin dalam mengelola data master handphone. Ketika admin menambahkan handphone baru, sistem akan otomatis membuat 8 kendala default beserta sparepart untuk masing-masing kendala.

## ✨ Fitur Utama

### 1. Auto-Generate Kendala & Sparepart
Saat admin membuat handphone baru (contoh: Samsung Galaxy S25), sistem otomatis generate:

**8 Kendala Default:**
1. ✅ Ganti Baterai → Sparepart: "Baterai Samsung Galaxy S25"
2. ✅ Ganti LCD → Sparepart: "LCD Samsung Galaxy S25"
3. ✅ Ganti Mic → Sparepart: "Mic Samsung Galaxy S25"
4. ✅ Ganti Speaker → Sparepart: "Speaker Samsung Galaxy S25"
5. ✅ Ganti Kamera → Sparepart: "Kamera Samsung Galaxy S25"
6. ✅ Ganti Tombol Power dan Volume → Sparepart: "Tombol Power dan Volume Samsung Galaxy S25"
7. ✅ Install Ulang → Sparepart: "Jasa Install Ulang Samsung Galaxy S25"
8. ✅ Handphone Tidak Bisa Menyala → Sparepart: "Jasa Service Mati Total Samsung Galaxy S25"

### 2. Admin Hanya Input Harga & Stok
- ✅ Nama sparepart sudah di-generate otomatis
- ✅ Admin hanya perlu input **harga** dan **jumlah stok**
- ✅ Default harga: Rp 0 (admin update nanti)
- ✅ Default stok: 0 unit (admin update nanti)

### 3. Cascade Delete (Smart Delete)
- ✅ Menghapus handphone = otomatis hapus semua kendala & sparepart terkait
- ✅ Modal konfirmasi menampilkan:
  - Jumlah kendala yang akan terhapus
  - Jumlah sparepart yang akan terhapus
  - Daftar detail kendala dengan jumlah sparepart masing-masing
- ✅ Proteksi: Tidak bisa hapus jika ada service aktif

## 🔄 Workflow

### Menambah Handphone Baru

```
1. Admin buka Master Data → Tab Handphone
2. Klik "Tambah Data Baru"
3. Input Brand: "Samsung"
4. Input Tipe: "Galaxy S25"
5. Klik "Simpan"
```

**Hasil Otomatis:**
- ✅ 1 Handphone created
- ✅ 8 Kendala created
- ✅ 8 Sparepart created (1 per kendala)
- ⏱️ Total waktu: ~1-2 detik

### Update Harga & Stok Sparepart

```
1. Admin buka Master Data → Tab Sparepart
2. Cari sparepart yang ingin diupdate (misal: "LCD Samsung Galaxy S25")
3. Klik "Edit"
4. Input Harga: 2.500.000
5. Input Jumlah Stok: 5
6. Klik "Simpan"
```

### Menghapus Handphone

```
1. Admin buka Master Data → Tab Handphone
2. Klik "Hapus" pada handphone yang ingin dihapus
3. Modal konfirmasi muncul dengan info:
   - Brand & Tipe handphone
   - Jumlah kendala: 8
   - Jumlah sparepart: 8
   - Daftar kendala lengkap
4. Jika ada service aktif → Tidak bisa dihapus
5. Jika aman → Klik "Ya, Hapus Semua"
```

**Hasil:**
- ✅ Handphone dihapus
- ✅ 8 Kendala dihapus otomatis
- ✅ 8 Sparepart dihapus otomatis

## 🎯 Keuntungan

### Untuk Admin
- ⚡ **Hemat Waktu**: Tidak perlu input 8 kendala & 8 sparepart manual
- 🎯 **Konsisten**: Semua handphone pasti punya 8 kendala standar
- 🔒 **Aman**: Cascade delete dengan konfirmasi detail
- 📊 **Terorganisir**: Data selalu lengkap dan terstruktur

### Untuk Sistem
- 🚀 **Efisien**: Transaction database memastikan atomicity
- 🛡️ **Data Integrity**: Cascade delete mencegah orphaned data
- 📦 **Scalable**: Mudah menambah template kendala baru
- 🔄 **Maintainable**: Template terpusat di API

## 🗂️ Database Schema

### PergantianBarang (Updated)
```prisma
model PergantianBarang {
  id                 String           @id @default(uuid())
  namaBarang         String
  harga              Float
  jumlahStok         Int              @default(0)      // ← NEW
  kendalaHandphoneId String
  kendalaHandphone   KendalaHandphone @relation(fields: [kendalaHandphoneId], references: [id], onDelete: Cascade)  // ← CASCADE
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}
```

### KendalaHandphone (Updated)
```prisma
model KendalaHandphone {
  id               String             @id @default(uuid())
  topikMasalah     String
  handphoneId      String
  handphone        Handphone          @relation(fields: [handphoneId], references: [id], onDelete: Cascade)  // ← CASCADE
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  pergantianBarang PergantianBarang[]
  services         Service[]
}
```

## 🔧 API Endpoints

### POST /api/handphone
**Auto-Generate Kendala & Sparepart**

Request:
```json
{
  "brand": "Samsung",
  "tipe": "Galaxy S25"
}
```

Response:
```json
{
  "message": "Handphone created successfully with 8 default kendala and spareparts",
  "data": {
    "id": "uuid",
    "brand": "Samsung",
    "tipe": "Galaxy S25",
    "kendalaHandphone": [
      {
        "id": "uuid",
        "topikMasalah": "Ganti Baterai",
        "pergantianBarang": [
          {
            "id": "uuid",
            "namaBarang": "Baterai Samsung Galaxy S25",
            "harga": 0,
            "jumlahStok": 0
          }
        ]
      }
      // ... 7 kendala lainnya
    ]
  },
  "info": "Admin can now update prices and stock for each sparepart"
}
```

### GET /api/handphone/delete-info/:id
**Preview Delete Information**

Response:
```json
{
  "status": true,
  "content": {
    "id": "uuid",
    "brand": "Samsung",
    "tipe": "Galaxy S25",
    "hasActiveServices": false,
    "activeServicesCount": 0,
    "kendalaCount": 8,
    "sparepartCount": 8,
    "canDelete": true,
    "kendalaList": [
      {
        "id": "uuid",
        "topikMasalah": "Ganti Baterai",
        "sparepartCount": 1
      }
      // ... 7 kendala lainnya
    ]
  }
}
```

### DELETE /api/handphone?id=:id
**Cascade Delete**

Response Success:
```json
{
  "message": "Handphone and all related data deleted successfully",
  "data": {
    "id": "uuid",
    "brand": "Samsung",
    "tipe": "Galaxy S25",
    "deletedCounts": {
      "kendala": 8,
      "spareparts": 8
    }
  }
}
```

Response Error (Has Active Services):
```json
{
  "error": "Conflict",
  "message": "Cannot delete handphone. It is being used by 3 active service(s). Please complete or cancel the services first.",
  "status": 409
}
```

## 📱 UI Components

### Modal Delete Confirmation
- ⚠️ **Warning Section**: Peringatan hapus dengan icon
- 📊 **Statistics**: Card jumlah kendala & sparepart
- 📝 **Detail List**: Scrollable list semua kendala
- 🚫 **Blocker Alert**: Notifikasi jika ada service aktif
- ✅ **Action Buttons**: Hapus / Batal dengan loading state

### Form Sparepart (Updated)
- 📦 **Nama Sparepart**: Text input
- 💰 **Harga**: Number input (Rupiah)
- 📊 **Jumlah Stok**: Number input (Units)
- 🔗 **Kendala**: Select dropdown
- 💾 **Save**: Submit dengan validasi

### Table Sparepart (Updated)
- ✨ **Kolom Baru**: Stok dengan color badge
- 🟢 **Stok > 0**: Green badge "X unit"
- 🔴 **Stok = 0**: Red badge "0 unit"
- 📱 **Responsive**: Card layout mobile, table desktop

## 🔐 Security & Validation

### API Level
- ✅ JWT Authentication required
- ✅ Admin role check (CRUD operations)
- ✅ Input validation (required fields)
- ✅ Number validation (harga, stok >= 0)
- ✅ Relation check (kendala exists, handphone exists)

### Business Logic
- ✅ Cascade delete only if no active services
- ✅ Transaction ensure atomicity
- ✅ Auto-rollback on error

## 📝 Migration History

**Migration:** `20251214181005_add_jumlahstok_and_cascade_delete`

Changes:
1. Added `jumlahStok Int @default(0)` to PergantianBarang
2. Added `onDelete: Cascade` to KendalaHandphone relation
3. Added `onDelete: Cascade` to PergantianBarang relation

## 🚀 Next Steps (Optional Enhancements)

1. **Bulk Price Update**: Update harga semua sparepart satu handphone sekaligus
2. **Stock Alert**: Notifikasi ketika stok < threshold
3. **Price History**: Track perubahan harga sparepart
4. **Template Management**: Admin bisa customize kendala template
5. **Import/Export**: Bulk import handphone dari CSV/Excel

## 💡 Best Practices

### Untuk Admin
1. ✅ Selalu update harga & stok setelah add handphone baru
2. ✅ Check modal konfirmasi dengan teliti sebelum hapus
3. ✅ Pastikan tidak ada service aktif sebelum hapus handphone
4. ✅ Gunakan tab Sparepart untuk monitoring stok

### Untuk Developer
1. ✅ Jangan ubah template kendala tanpa koordinasi
2. ✅ Selalu test cascade delete di development first
3. ✅ Monitor database size (8 kendala × 8 sparepart per HP)
4. ✅ Keep transaction timeout reasonable

---

## 📞 Support

Jika ada pertanyaan atau issue, hubungi developer team.

**Last Updated:** December 15, 2024
**Version:** 2.0.0
