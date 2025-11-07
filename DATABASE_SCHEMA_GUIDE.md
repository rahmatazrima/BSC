# Database Schema & Relationship Guide

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│   PergantianBarang  │
│                     │
│ + id (PK)          │
│ + namaBarang       │
│ + harga            │
│ + createdAt        │
│ + updatedAt        │
└──────────┬──────────┘
           │ 1
           │ (one-to-one)
           │ 1
┌──────────┴──────────┐
│  KendalaHandphone   │
│                     │
│ + id (PK)          │
│ + topikMasalah     │
│ + pergantianBarangId (FK) │
│ + createdAt        │
│ + updatedAt        │
└──────────┬──────────┘
           │ 1
           │ (one-to-many)
           │ *
┌──────────┴──────────┐
│     Handphone       │
│                     │
│ + id (PK)          │
│ + brand            │
│ + tipe             │
│ + kendalaHandphoneId (FK) │
│ + createdAt        │
│ + updatedAt        │
└──────────┬──────────┘
           │ 1
           │ 
           │ * (many-to-one)
           │
┌──────────┴──────────┐       ┌─────────────────┐
│      Service        │───────│      User       │
│                     │   *   │                 │
│ + id (PK)          │───┐   │ + id (PK)      │
│ + statusService    │   │   │ + email         │
│ + tempat           │   │   │ + name          │
│ + tanggalPesan     │   │   │ + password      │
│ + userId (FK)      │───┘   │ + phoneNumber   │
│ + handphoneId (FK) │       │ + role          │
│ + waktuId (FK)     │───┐   │ + createdAt     │
│ + createdAt        │   │   │ + updatedAt     │
│ + updatedAt        │   │   └─────────────────┘
└────────────────────┘   │
                         │ * (many-to-one)
                         │ 1
                    ┌────┴──────────┐
                    │     Waktu      │
                    │                │
                    │ + id (PK)     │
                    │ + namaShift    │
                    │ + jamMulai     │
                    │ + jamSelesai   │
                    │ + isAvailable  │
                    │ + createdAt    │
                    │ + updatedAt    │
                    └────────────────┘
```

## Relationship Details

### 1. PergantianBarang ←→ KendalaHandphone
**Type**: One-to-One
- Satu sparepart hanya bisa digunakan oleh satu kendala
- Satu kendala memiliki satu sparepart pengganti

**Constraint**: 
```prisma
kendalaHandphoneId String @unique  // Ensures one-to-one
```

**Business Logic**:
- Setiap masalah HP memiliki satu sparepart spesifik untuk perbaikannya
- Contoh: Masalah "LCD Rusak" → Sparepart "LCD iPhone 14 Pro"

---

### 2. KendalaHandphone ←→ Handphone
**Type**: One-to-Many
- Satu kendala bisa dimiliki oleh banyak handphone
- Satu handphone memiliki satu kendala spesifik

**Constraint**:
```prisma
kendalaHandphoneId String  // Foreign key (not unique)
```

**Business Logic**:
- Berbagai tipe HP bisa memiliki masalah yang sama
- Contoh: 
  - iPhone 14 Pro → LCD Rusak
  - iPhone 14 → LCD Rusak (kendala yang sama)
  - Samsung S23 → LCD Rusak (kendala yang sama)

---

### 3. Handphone ←→ Service
**Type**: One-to-Many
- Satu handphone entry bisa digunakan di banyak service booking
- Satu service booking merujuk ke satu handphone entry

**Constraint**:
```prisma
handphoneId String  // Foreign key
```

**Business Logic**:
- Ketika customer booking service, mereka memilih kombinasi HP + masalah
- Sistem mencari handphone entry yang sesuai dengan brand, tipe, dan kendala

---

### 4. User ←→ Service
**Type**: One-to-Many
- Satu user bisa melakukan banyak service booking
- Satu service booking dimiliki oleh satu user

**Constraint**:
```prisma
userId String  // Foreign key
```

**Business Logic**:
- Setiap booking service harus terkait dengan user yang membuat booking
- User bisa melihat history semua booking mereka

---

### 5. Waktu ←→ Service
**Type**: One-to-Many
- Satu waktu/shift bisa digunakan di banyak service booking
- Satu service booking memiliki satu slot waktu

**Constraint**:
```prisma
waktuId String  // Foreign key
```

**Business Logic**:
- Customer memilih waktu/shift saat booking
- Multiple bookings bisa di waktu yang sama (tergantung kapasitas)

---

## Table Definitions

### PergantianBarang
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique identifier |
| namaBarang | String | Required | Nama sparepart |
| harga | Float | Required | Harga dalam Rupiah |
| createdAt | DateTime | Auto | Waktu dibuat |
| updatedAt | DateTime | Auto | Waktu update terakhir |

**Indexes**:
- Primary: `id`
- Unique constraint on `namaBarang` (case-insensitive via API)

---

### KendalaHandphone
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique identifier |
| topikMasalah | String | Required | Jenis masalah |
| pergantianBarangId | String | FK, Unique | Reference ke PergantianBarang |
| createdAt | DateTime | Auto | Waktu dibuat |
| updatedAt | DateTime | Auto | Waktu update terakhir |

**Relationships**:
- `pergantianBarang`: One-to-one with PergantianBarang

**Indexes**:
- Primary: `id`
- Unique: `pergantianBarangId`

---

### Handphone
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique identifier |
| brand | String | Required | Brand HP (iPhone, Samsung, dll) |
| tipe | String | Required | Tipe/Model HP |
| kendalaHandphoneId | String | FK | Reference ke KendalaHandphone |
| createdAt | DateTime | Auto | Waktu dibuat |
| updatedAt | DateTime | Auto | Waktu update terakhir |

**Relationships**:
- `kendalaHanphone`: Many-to-one with KendalaHandphone

**Indexes**:
- Primary: `id`
- Composite unique constraint via API: `brand + tipe + kendalaHandphoneId`

---

### Waktu
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique identifier |
| namaShift | String | Required | Nama shift |
| jamMulai | String | Required | Format HH:MM |
| jamSelesai | String | Required | Format HH:MM |
| isAvailable | Boolean | Default: true | Status ketersediaan |
| createdAt | DateTime | Auto | Waktu dibuat |
| updatedAt | DateTime | Auto | Waktu update terakhir |

**Relationships**:
- `services`: One-to-many with Service

**Indexes**:
- Primary: `id`

**Validations**:
- `jamMulai < jamSelesai`
- No time overlap between shifts
- Unique `namaShift`

---

### User
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique identifier |
| email | String | Unique, Required | Email login |
| name | String | Required | Nama lengkap |
| password | String | Required | Hashed password |
| phoneNumber | String | Required | Nomor telepon |
| role | Enum | Default: USER | USER or ADMIN |
| createdAt | DateTime | Auto | Waktu dibuat |
| updatedAt | DateTime | Auto | Waktu update terakhir |

**Relationships**:
- `services`: One-to-many with Service

**Indexes**:
- Primary: `id`
- Unique: `email`

---

### Service
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique identifier |
| statusService | Enum | Default: PENDING | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| tempat | String | Required | Lokasi service |
| tanggalPesan | DateTime | Required | Tanggal booking |
| userId | String | FK | Reference ke User |
| handphoneId | String | FK | Reference ke Handphone |
| waktuId | String | FK | Reference ke Waktu |
| createdAt | DateTime | Auto | Waktu dibuat |
| updatedAt | DateTime | Auto | Waktu update terakhir |

**Relationships**:
- `user`: Many-to-one with User
- `handphone`: Many-to-one with Handphone
- `waktu`: Many-to-one with Waktu

**Indexes**:
- Primary: `id`
- Foreign keys: `userId`, `handphoneId`, `waktuId`

---

## Data Flow Example

### Scenario: Customer Booking Service untuk iPhone 14 Pro dengan LCD Rusak

1. **Admin Setup** (via Master Data page):
   ```
   1. Create PergantianBarang:
      - namaBarang: "LCD iPhone 14 Pro"
      - harga: 2500000
   
   2. Create KendalaHandphone:
      - topikMasalah: "LCD Rusak"
      - pergantianBarangId: [id dari step 1]
   
   3. Create Handphone:
      - brand: "iPhone"
      - tipe: "14 Pro"
      - kendalaHandphoneId: [id dari step 2]
   
   4. Create Waktu:
      - namaShift: "Shift 1"
      - jamMulai: "08:00"
      - jamSelesai: "12:00"
   ```

2. **Customer Booking** (via Booking page):
   ```
   Customer selects:
   - Brand: iPhone
   - Tipe: 14 Pro
   - Kendala: LCD Rusak
   - Waktu: Shift 1
   - Tanggal: 2024-01-15
   
   System creates Service:
   - userId: [current logged user]
   - handphoneId: [id from Handphone table]
   - waktuId: [id from Waktu table]
   - statusService: PENDING
   - tempat: "Bukhari Service Center"
   - tanggalPesan: 2024-01-15
   ```

3. **Admin Views** (via Dashboard):
   ```
   Service detail shows:
   - Customer: John Doe (from User table)
   - Device: iPhone 14 Pro (from Handphone table)
   - Problem: LCD Rusak (from KendalaHandphone via Handphone)
   - Spare Part: LCD iPhone 14 Pro (from PergantianBarang via KendalaHandphone)
   - Price: Rp 2,500,000 (from PergantianBarang)
   - Time Slot: Shift 1 (08:00 - 12:00) (from Waktu table)
   ```

---

## Cascade Delete Rules

### Delete Prevention (Enforced by API):

1. **Cannot delete PergantianBarang** if:
   - Used by any KendalaHandphone

2. **Cannot delete KendalaHandphone** if:
   - Used by any Handphone

3. **Cannot delete Handphone** if:
   - Used by any Service

4. **Cannot delete Waktu** if:
   - Used by any Service

5. **Cannot delete User** if:
   - Has any Service bookings (not enforced yet, consider business logic)

### Safe Delete Order (when cleaning up):
```
1. Delete Service records first
2. Delete Handphone records
3. Delete KendalaHandphone records
4. Delete PergantianBarang records
5. Delete Waktu records
6. Delete User records (if needed)
```

---

## Database Queries Examples

### Get Full Service Details:
```typescript
const service = await prisma.service.findUnique({
  where: { id: serviceId },
  include: {
    user: true,
    handphone: {
      include: {
        kendalaHanphone: {
          include: {
            pergantianBarang: true
          }
        }
      }
    },
    waktu: true
  }
});

// Result structure:
{
  id: "uuid",
  statusService: "PENDING",
  user: { name: "John Doe", email: "john@example.com" },
  handphone: {
    brand: "iPhone",
    tipe: "14 Pro",
    kendalaHanphone: {
      topikMasalah: "LCD Rusak",
      pergantianBarang: {
        namaBarang: "LCD iPhone 14 Pro",
        harga: 2500000
      }
    }
  },
  waktu: {
    namaShift: "Shift 1",
    jamMulai: "08:00",
    jamSelesai: "12:00"
  }
}
```

---

## Schema Migration Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name add_master_data_tables

# Apply migrations to production
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

---

**Last Updated**: 2024
**Database**: PostgreSQL
**ORM**: Prisma

