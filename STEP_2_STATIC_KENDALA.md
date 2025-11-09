# Step 2 - Static Kendala Implementation

## ✅ Perubahan yang Dilakukan

### 1. **6 Kendala Statis** ✅
```typescript
const staticProblems = [
  "Ganti Baterai",
  "Ganti LCD",
  "Install Ulang",
  "Ganti Speaker",
  "Ganti Tombol Power dan Volume",
  "Ganti Kamera"
];
```
- **Kendala SELALU ditampilkan** (tidak fetch dari database untuk display)
- **6 kendala yang sama untuk semua user**
- Tidak perlu kondisi loading

### 2. **Check Availability dari Database** ✅
```typescript
const getKendalaForProblem = (problemName: string) => {
  if (!serviceData.handphoneId) return null;
  
  // Cari kendala di database yang match dengan:
  // - handphoneId yang dipilih
  // - topikMasalah yang sama dengan nama statis
  return kendalas.find((k: KendalaHandphone) => 
    k.handphoneId === serviceData.handphoneId && 
    k.topikMasalah === problemName
  );
};
```

**Logic:**
1. Check apakah user sudah pilih handphone
2. Cari di database: kendala dengan `handphoneId` yang sama DAN `topikMasalah` yang sama
3. Jika **DITEMUKAN** → Button aktif (bisa diklik)
4. Jika **TIDAK DITEMUKAN** → Button disabled (tidak bisa diklik)

### 3. **Tidak Ada Harga** ✅
- Hanya tampilkan nama kendala
- Harga ditampilkan di Step 5

## Cara Kerja

### Skenario 1: User Belum Pilih Handphone
```
→ Tampil pesan: "Silakan pilih handphone terlebih dahulu di Step 1"
→ Kendala belum muncul
```

### Skenario 2: User Pilih Samsung Galaxy S24

**Database:**
```sql
-- Kendala untuk Samsung Galaxy S24
INSERT INTO KendalaHandphone VALUES
  ('k1', 'Ganti LCD', 'samsung-s24-id'),
  ('k2', 'Ganti Baterai', 'samsung-s24-id'),
  ('k3', 'Ganti Kamera', 'samsung-s24-id');
```

**Tampilan Step 2:**
```
┌──────────────────────────┐  ┌──────────────────────────┐
│ Ganti Baterai            │  │ Ganti LCD                │
│ ✅ AKTIF (putih)         │  │ ✅ AKTIF (putih)         │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ Install Ulang            │  │ Ganti Speaker            │
│ ❌ DISABLED (abu-abu)    │  │ ❌ DISABLED (abu-abu)    │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ Ganti Tombol Power...    │  │ Ganti Kamera             │
│ ❌ DISABLED (abu-abu)    │  │ ✅ AKTIF (putih)         │
└──────────────────────────┘  └──────────────────────────┘
```

**Penjelasan:**
- ✅ **Ganti Baterai** → Ada di database untuk Samsung S24 → AKTIF
- ✅ **Ganti LCD** → Ada di database untuk Samsung S24 → AKTIF
- ❌ **Install Ulang** → Tidak ada di database untuk Samsung S24 → DISABLED
- ❌ **Ganti Speaker** → Tidak ada di database untuk Samsung S24 → DISABLED
- ❌ **Ganti Tombol Power** → Tidak ada di database untuk Samsung S24 → DISABLED
- ✅ **Ganti Kamera** → Ada di database untuk Samsung S24 → AKTIF

### Skenario 3: User Klik Kendala
```
✅ JIKA AKTIF:
  → Kendala dipilih (border biru)
  → kendalaId disimpan ke serviceData.kendalaIds
  → Counter bertambah

❌ JIKA DISABLED:
  → Tidak terjadi apa-apa
  → Cursor: not-allowed (🚫)
```

## Visual Design

### Kendala Aktif (Tersedia):
```css
border-white/20        /* Border putih transparan */
bg-white/5             /* Background putih 5% */
text-gray-300          /* Text abu-abu terang */
hover:border-blue-500  /* Hover: border biru */
cursor-pointer         /* Cursor: pointer */
```

### Kendala Disabled (Tidak Tersedia):
```css
border-gray-700        /* Border abu-abu gelap */
bg-gray-800/30         /* Background abu-abu 30% */
text-gray-500          /* Text abu-abu */
cursor-not-allowed     /* Cursor: not-allowed */
opacity-50             /* Opacity 50% */
```

### Kendala Selected (Dipilih):
```css
border-blue-500        /* Border biru */
bg-blue-500/20         /* Background biru 20% */
text-white             /* Text putih */
```

## Keuntungan Pendekatan Ini

### 1. **UI Konsisten**
- Semua user melihat 6 kendala yang sama
- Tidak ada perbedaan jumlah kendala antar HP
- User tahu semua opsi yang tersedia

### 2. **Flexibility**
- Admin bisa tambah/hapus kendala di database
- Kendala yang tidak tersedia otomatis disabled
- Tidak perlu update frontend code

### 3. **User Experience**
- User lihat semua opsi
- Tahu kendala mana yang tersedia/tidak
- Tidak bingung kenapa opsi berbeda per HP

### 4. **Maintenance**
- Static list mudah di-maintain
- Perubahan kendala hanya di database
- Tidak perlu sync nama kendala

## Database Requirements

Agar kendala bisa dipilih, harus ada record di database:

```sql
-- Kendala harus match PERSIS dengan nama statis
INSERT INTO KendalaHandphone (id, topikMasalah, handphoneId)
VALUES 
  ('k1', 'Ganti Baterai', 'samsung-s24-id'),
  ('k2', 'Ganti LCD', 'samsung-s24-id'),
  ('k3', 'Install Ulang', 'iphone-15-id'),
  ('k4', 'Ganti Speaker', 'xiaomi-13-id'),
  ('k5', 'Ganti Tombol Power dan Volume', 'oppo-a17-id'),
  ('k6', 'Ganti Kamera', 'samsung-s24-id');

-- PENTING: topikMasalah harus PERSIS sama dengan nama statis!
-- ✅ "Ganti LCD" → Match
-- ❌ "Ganti Layar LCD" → Tidak match
```

## Matching Logic

```typescript
// 1. Static Problems (Frontend)
const staticProblems = [
  "Ganti Baterai",
  "Ganti LCD",
  ...
];

// 2. Database Check
kendalas.find((k) => 
  k.handphoneId === selectedHandphoneId &&  // ← Filter by HP
  k.topikMasalah === "Ganti Baterai"       // ← Match nama persis
);

// 3. Result
// Found? → Button aktif
// Not found? → Button disabled
```

## Example Flow

### User Journey:
1. **Step 1:** Pilih Samsung Galaxy S24
2. **Step 2:** 
   - Muncul 6 kendala statis
   - System check database untuk Samsung S24
   - "Ganti LCD" ditemukan → AKTIF ✅
   - "Install Ulang" tidak ditemukan → DISABLED ❌
3. User klik "Ganti LCD" (aktif)
4. kendalaId disimpan
5. **Step 5:** Tampil harga dari database

## Testing

### Test Case 1: Semua Kendala Tersedia
```
HP: Samsung S24
Database: Semua 6 kendala ada untuk Samsung S24
Result: Semua button aktif ✅
```

### Test Case 2: Sebagian Kendala Tersedia
```
HP: Samsung S24
Database: Hanya 3 kendala (LCD, Baterai, Kamera)
Result: 
  - 3 button aktif (LCD, Baterai, Kamera) ✅
  - 3 button disabled (Install, Speaker, Tombol) ❌
```

### Test Case 3: Tidak Ada Kendala
```
HP: Oppo A17
Database: Tidak ada kendala untuk Oppo A17
Result: Semua 6 button disabled ❌
```

### Test Case 4: Nama Tidak Match
```
HP: Samsung S24
Database: Ada "Ganti Layar LCD" (bukan "Ganti LCD")
Result: "Ganti LCD" disabled karena nama tidak persis match ❌
```

## Important Notes

1. **Nama Kendala Harus PERSIS**
   - Static: `"Ganti LCD"`
   - Database: `"Ganti LCD"` ✅
   - Database: `"Ganti Layar LCD"` ❌

2. **Case Sensitive**
   - `"Ganti LCD"` ≠ `"ganti lcd"`
   - Pastikan casing sama persis

3. **Kendala Tidak di Step 2**
   - Tidak tampilkan harga
   - Tidak tampilkan sparepart
   - Hanya nama kendala

4. **Harga di Step 5**
   - Tampilkan nama kendala
   - Tampilkan sparepart
   - Tampilkan harga
   - Tampilkan total

## Status
✅ **COMPLETED**
- 6 kendala statis ditampilkan
- Availability check dari database
- Disable kendala tidak tersedia
- Tidak ada harga di Step 2
- Matching berdasarkan handphoneId & topikMasalah

