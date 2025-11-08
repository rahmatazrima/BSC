# 🔄 Schema Database - Update Guide

## 📋 Perubahan Structure

### ❌ Schema LAMA (Before):
```
PergantianBarang (Sparepart) → dibuat pertama
    ↓ (one-to-one)
KendalaHandphone → pergantianBarangId
    ↓ (one-to-many)
Handphone → kendalaHandphoneId
```

### ✅ Schema BARU (After):
```
Handphone → dibuat pertama (hanya brand & tipe)
    ↓ (one-to-many)
KendalaHandphone → handphoneId
    ↓ (one-to-many)
PergantianBarang → kendalaHandphoneId
```

---

## 🎯 Alur Baru (Lebih Logis)

### Step 1: Buat Handphone
```sql
Handphone {
  id: uuid
  brand: "iPhone"
  tipe: "14 Pro"
}
```

### Step 2: Buat Kendala untuk HP tersebut
```sql
KendalaHandphone {
  id: uuid
  topikMasalah: "LCD Rusak"
  handphoneId: [id dari iPhone 14 Pro]
}
```

### Step 3: Buat Sparepart untuk Kendala tersebut
```sql
PergantianBarang {
  id: uuid
  namaBarang: "LCD iPhone 14 Pro Original"
  harga: 2500000
  kendalaHandphoneId: [id dari LCD Rusak]
}
```

---

## 📊 Relationship Details

### 1. Handphone ←→ KendalaHandphone
**Type**: One-to-Many
- Satu HP bisa punya banyak kendala berbeda
- Satu kendala hanya untuk satu tipe HP

**Contoh:**
```
iPhone 14 Pro:
  - LCD Rusak
  - Baterai Lemah
  - Speaker Mati
  - Kamera Blur
```

### 2. KendalaHandphone ←→ PergantianBarang
**Type**: One-to-Many
- Satu kendala bisa punya banyak opsi sparepart
- Satu sparepart untuk satu kendala spesifik

**Contoh:**
```
LCD Rusak (iPhone 14 Pro):
  - LCD iPhone 14 Pro Original (Rp 2.500.000)
  - LCD iPhone 14 Pro OEM (Rp 1.800.000)
  - LCD iPhone 14 Pro KW (Rp 1.200.000)
```

### 3. Handphone ←→ Service
**Type**: One-to-Many (Tetap sama)
- Service masih terhubung ke Handphone
- Untuk identifikasi HP yang di-service

---

## 🔧 Migration Steps

### 1. Backup Database (PENTING!)
```bash
# Export data existing
pg_dump -U postgres bukhari_service_center > backup_before_migration.sql
```

### 2. Generate Migration
```bash
npx prisma migrate dev --name restructure_relationships
```

**⚠️ WARNING**: Migration ini akan:
- Drop data existing di tabel Handphone, KendalaHandphone, PergantianBarang
- Recreate tabel dengan struktur baru
- **Data akan hilang!**

### 3. Jika Ingin Preserve Data

Jika ada data penting, lakukan manual migration:

```sql
-- Step 1: Buat tabel temporary
CREATE TABLE temp_handphone AS SELECT DISTINCT brand, tipe FROM Handphone;
CREATE TABLE temp_kendala AS SELECT * FROM KendalaHandphone;
CREATE TABLE temp_sparepart AS SELECT * FROM PergantianBarang;

-- Step 2: Drop foreign keys & tables
-- (akan dilakukan otomatis oleh Prisma migrate)

-- Step 3: Buat struktur baru
-- (akan dilakukan otomatis oleh Prisma migrate)

-- Step 4: Insert data dengan struktur baru
-- (perlu script custom)
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Restart Dev Server
```bash
npm run dev
```

---

## 🎨 Update Master Data Page

Halaman Master Data perlu diupdate untuk mengikuti alur baru:

### Tab Order Baru:
1. **📱 Handphone** (Tab pertama - dibuat dulu)
   - Input: Brand, Tipe
   - Tidak perlu pilih kendala

2. **⚠️ Kendala HP** (Tab kedua)
   - Input: Topik Masalah
   - Dropdown: Pilih Handphone (brand + tipe)

3. **🔧 Sparepart** (Tab ketiga)
   - Input: Nama Barang, Harga
   - Dropdown: Pilih Kendala

4. **⏰ Waktu/Shift** (Tetap sama)

---

## 📝 Update API Routes

### 1. Update `/api/handphone/route.ts`

**POST - Create Handphone:**
```typescript
// BEFORE (memerlukan kendalaHandphoneId)
const { brand, tipe, kendalaHandphoneId } = body;

// AFTER (hanya brand & tipe)
const { brand, tipe } = body;

const newHandphone = await prisma.handphone.create({
  data: { brand, tipe }
});
```

**GET - Fetch Handphone:**
```typescript
// Include kendala yang terkait
const handphoneList = await prisma.handphone.findMany({
  include: {
    kendalaHandphone: {
      include: {
        pergantianBarang: true
      }
    }
  }
});
```

### 2. Update `/api/kendala-handphone/route.ts`

**POST - Create Kendala:**
```typescript
// BEFORE (memerlukan pergantianBarangId)
const { topikMasalah, pergantianBarangId } = body;

// AFTER (memerlukan handphoneId)
const { topikMasalah, handphoneId } = body;

// Validasi handphone exists
const handphoneExists = await prisma.handphone.findUnique({
  where: { id: handphoneId }
});

if (!handphoneExists) {
  return NextResponse.json(
    { error: 'Handphone not found' },
    { status: 404 }
  );
}

const newKendala = await prisma.kendalaHandphone.create({
  data: { topikMasalah, handphoneId },
  include: {
    handphone: true,
    pergantianBarang: true
  }
});
```

### 3. Update `/api/pergantian-barang/route.ts`

**POST - Create Sparepart:**
```typescript
// BEFORE (tidak ada foreign key)
const { namaBarang, harga } = body;

// AFTER (memerlukan kendalaHandphoneId)
const { namaBarang, harga, kendalaHandphoneId } = body;

// Validasi kendala exists
const kendalaExists = await prisma.kendalaHandphone.findUnique({
  where: { id: kendalaHandphoneId }
});

if (!kendalaExists) {
  return NextResponse.json(
    { error: 'Kendala handphone not found' },
    { status: 404 }
  );
}

const newSparepart = await prisma.pergantianBarang.create({
  data: { 
    namaBarang, 
    harga: parseFloat(harga),
    kendalaHandphoneId 
  },
  include: {
    kendalaHandphone: {
      include: {
        handphone: true
      }
    }
  }
});
```

---

## 🎯 Contoh Data Flow

### Scenario: Service Center Melayani iPhone 14 Pro dengan Masalah LCD

#### Step 1: Admin Input Handphone
```
Tab: Handphone
Input:
  Brand: iPhone
  Tipe: 14 Pro
  
Result: Handphone ID = abc123
```

#### Step 2: Admin Input Kendala
```
Tab: Kendala
Input:
  Handphone: iPhone 14 Pro (dropdown)
  Topik Masalah: LCD Rusak
  
Result: Kendala ID = def456
```

#### Step 3: Admin Input Sparepart (bisa multiple)
```
Tab: Sparepart
Input 1:
  Kendala: LCD Rusak - iPhone 14 Pro (dropdown)
  Nama Barang: LCD iPhone 14 Pro Original
  Harga: 2500000

Input 2:
  Kendala: LCD Rusak - iPhone 14 Pro (dropdown)
  Nama Barang: LCD iPhone 14 Pro OEM
  Harga: 1800000
  
Result: 
  - Sparepart ID = ghi789
  - Sparepart ID = jkl012
```

#### Step 4: Customer Booking
```
Customer pilih:
  - Handphone: iPhone 14 Pro
  
Sistem tampilkan kendala untuk HP tersebut:
  - LCD Rusak (Rp 2.500.000 - Original)
  - LCD Rusak (Rp 1.800.000 - OEM)
  - Baterai Lemah (Rp 850.000)
  - dll
  
Customer pilih: LCD Rusak (Original - Rp 2.500.000)
```

---

## 🔒 Validation Rules

### Handphone:
- ✅ Brand required
- ✅ Tipe required
- ✅ Kombinasi brand + tipe bisa duplikat (boleh ada multiple entry untuk testing)

### KendalaHandphone:
- ✅ topikMasalah required
- ✅ handphoneId required (must exist)
- ✅ Kombinasi handphoneId + topikMasalah harus unique

### PergantianBarang:
- ✅ namaBarang required
- ✅ harga required (min: 0)
- ✅ kendalaHandphoneId required (must exist)
- ✅ Bisa ada multiple sparepart untuk kendala yang sama (Original, OEM, KW)

---

## 📸 Database Queries - New Structure

### Query 1: Get HP dengan semua kendala & sparepartnya
```typescript
const handphone = await prisma.handphone.findUnique({
  where: { id: handphoneId },
  include: {
    kendalaHandphone: {
      include: {
        pergantianBarang: true
      }
    }
  }
});

// Result:
{
  id: "abc123",
  brand: "iPhone",
  tipe: "14 Pro",
  kendalaHandphone: [
    {
      id: "def456",
      topikMasalah: "LCD Rusak",
      pergantianBarang: [
        { namaBarang: "LCD Original", harga: 2500000 },
        { namaBarang: "LCD OEM", harga: 1800000 }
      ]
    },
    {
      id: "xyz789",
      topikMasalah: "Baterai Lemah",
      pergantianBarang: [
        { namaBarang: "Baterai Original", harga: 850000 }
      ]
    }
  ]
}
```

### Query 2: Get Kendala dengan HP & Sparepart info
```typescript
const kendala = await prisma.kendalaHandphone.findMany({
  include: {
    handphone: true,
    pergantianBarang: true
  }
});
```

### Query 3: Get Sparepart dengan Kendala & HP info
```typescript
const sparepart = await prisma.pergantianBarang.findMany({
  include: {
    kendalaHandphone: {
      include: {
        handphone: true
      }
    }
  }
});
```

---

## 🚀 Keuntungan Schema Baru

### ✅ Advantages:

1. **Lebih Logis:**
   - HP dibuat dulu (data master)
   - Kendala per HP
   - Harga per kendala

2. **Lebih Fleksibel:**
   - Bisa ada multiple sparepart untuk satu kendala
   - Original, OEM, KW dengan harga berbeda

3. **Lebih Scalable:**
   - Mudah menambah HP baru
   - Mudah menambah kendala per HP
   - Mudah menambah opsi sparepart

4. **Better User Experience:**
   - Admin input lebih terstruktur
   - Customer punya pilihan harga
   - Transparansi kualitas sparepart

---

## ⚠️ Breaking Changes

### Files yang Perlu Diupdate:

1. ✅ `prisma/schema.prisma` - DONE
2. ⚠️ `src/app/api/handphone/route.ts` - NEED UPDATE
3. ⚠️ `src/app/api/kendala-handphone/route.ts` - NEED UPDATE
4. ⚠️ `src/app/api/pergantian-barang/route.ts` - NEED UPDATE
5. ⚠️ `src/app/admin/master-data/page.tsx` - NEED UPDATE
6. ⚠️ `src/app/booking/page.tsx` - MIGHT NEED UPDATE

---

## 📋 Action Items

- [ ] Review schema changes
- [ ] Backup existing data
- [ ] Run migration
- [ ] Update API routes
- [ ] Update Master Data page
- [ ] Update Booking page (if needed)
- [ ] Test all CRUD operations
- [ ] Test Service booking flow
- [ ] Update documentation

---

**Updated**: November 8, 2024
**Status**: Schema Updated - Ready for Migration

