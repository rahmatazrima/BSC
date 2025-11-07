# ✅ Cara Mengecek Koneksi Database

## 1. Cek File .env

Pastikan file `.env` di root project memiliki `DATABASE_URL`:

```env
# Contoh format untuk PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Contoh lengkap:
DATABASE_URL="postgresql://postgres:password123@localhost:5432/bukhari_service_center?schema=public"
```

**Komponen URL:**
- `username`: User PostgreSQL Anda (default: `postgres`)
- `password`: Password PostgreSQL Anda
- `localhost`: Host database (local atau remote)
- `5432`: Port PostgreSQL (default: 5432)
- `database_name`: Nama database yang Anda buat
- `schema`: Schema database (default: `public`)

---

## 2. Cek Prisma Client Sudah Di-generate

Jalankan command ini untuk generate Prisma Client:

```bash
npx prisma generate
```

**Output yang diharapkan:**
```
✔ Generated Prisma Client (x.x.x) to ./node_modules/@prisma/client
```

---

## 3. Cek Migrasi Database

Lihat status migrasi:

```bash
npx prisma migrate status
```

**Jika belum migrate:**
```bash
npx prisma migrate dev
```

**Jika sudah pernah migrate (seperti Anda):**
Database sudah siap karena ada folder `migrations/20251002123923_init/`

---

## 4. Test Koneksi Database

### Cara 1: Buka Prisma Studio
```bash
npx prisma studio
```

Jika berhasil:
- Browser akan terbuka di `http://localhost:5555`
- Anda bisa lihat semua tabel dan data
- Ini membuktikan koneksi database **BERHASIL** ✅

### Cara 2: Jalankan Development Server
```bash
npm run dev
```

Lalu akses salah satu API endpoint untuk test:
```
http://localhost:3000/api/pergantian-barang
```

**Jika koneksi berhasil:**
- API akan return data (atau array kosong `[]` jika belum ada data)
- Status code: 200 OK

**Jika koneksi gagal:**
- Error: "Can't reach database server"
- Status code: 500

---

## 5. Troubleshooting

### Error: "Can't reach database server"

**Penyebab & Solusi:**

#### A. PostgreSQL belum running
```bash
# Windows (Check PostgreSQL service)
services.msc
# Cari "PostgreSQL" dan pastikan Running

# Atau start manual:
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

#### B. DATABASE_URL salah
```env
# ❌ SALAH
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# ✅ BENAR (sesuaikan dengan kredensial Anda)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bukhari_service_center?schema=public"
```

#### C. Database belum dibuat
```bash
# Masuk ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE bukhari_service_center;

# Keluar
\q
```

#### D. Password salah
- Cek password PostgreSQL Anda
- Update di file `.env`

---

## 6. Verifikasi Lengkap

### Jalankan Command Ini Satu Per Satu:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Cek status migration
npx prisma migrate status

# 3. Deploy migration (jika belum)
npx prisma migrate deploy

# 4. Buka Prisma Studio untuk test
npx prisma studio
```

### Expected Result:
```
✅ Prisma Client generated
✅ Migrations applied
✅ Prisma Studio opened at http://localhost:5555
```

---

## 7. Test Master Data Page

Setelah database terkoneksi:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login sebagai Admin:**
   ```
   http://localhost:3000/login
   ```

3. **Akses Master Data:**
   ```
   http://localhost:3000/admin/master-data
   ```

4. **Test CRUD:**
   - Tambah Sparepart baru
   - Lihat data di Prisma Studio
   - Jika data muncul di Studio = **KONEKSI BERHASIL!** 🎉

---

## 8. Cek di Prisma Studio

Setelah input data via Master Data page:

```bash
npx prisma studio
```

Buka tabel:
- `PergantianBarang` - Lihat sparepart yang ditambahkan
- `KendalaHandphone` - Lihat kendala
- `Handphone` - Lihat data HP
- `Waktu` - Lihat shift

Jika data muncul = **Integrasi Perfect!** ✅

---

## Summary Checklist

- [ ] File `.env` ada dan `DATABASE_URL` terisi
- [ ] PostgreSQL service running
- [ ] Database sudah dibuat
- [ ] `npx prisma generate` berhasil
- [ ] Migrations sudah applied
- [ ] Prisma Studio bisa dibuka
- [ ] Dev server running
- [ ] Bisa login sebagai admin
- [ ] Master Data page bisa diakses
- [ ] CRUD berfungsi (test tambah data)
- [ ] Data muncul di Prisma Studio

**Jika semua ✅ = Database terkoneksi sempurna!**

---

## Status Saat Ini

Berdasarkan file structure Anda:
- ✅ Schema Prisma sudah ada (`prisma/schema.prisma`)
- ✅ Migrations sudah ada (`migrations/20251002123923_init/`)
- ✅ API routes sudah lengkap (`api/handphone/`, `api/kendala-handphone/`, dll)
- ✅ Middleware sudah aktif (`middleware.ts`)
- ✅ Master Data page sudah dibuat (`admin/master-data/page.tsx`)

**Yang perlu dipastikan:**
- ⚠️ Database PostgreSQL running
- ⚠️ `.env` dengan `DATABASE_URL` yang benar
- ⚠️ Prisma Client sudah di-generate

---

## Quick Test Command

Jalankan ini untuk test cepat:

```bash
# Test 1: Generate client
npx prisma generate

# Test 2: Buka studio
npx prisma studio

# Test 3: Start dev server
npm run dev
```

Jika semua berjalan tanpa error = **Database sudah terkoneksi!** ✅

