# Panduan Migrasi Prisma ke Neon Database

## Langkah 1: Membuat Database di Neon

1. **Daftar/Login ke Neon**
   - Kunjungi https://neon.tech
   - Daftar atau login dengan akun Anda

2. **Buat Project Baru**
   - Klik "Create Project"
   - Berikan nama project (misalnya: "BukhariServiceCenter")
   - Pilih region yang terdekat dengan lokasi Anda
   - Klik "Create Project"

3. **Dapatkan Connection String**
   - Setelah project dibuat, Neon akan menampilkan connection string
   - Copy connection string yang formatnya seperti:
     ```
     postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
     ```

## Langkah 2: Setup Environment Variable

1. **Buat file `.env` di root project** (jika belum ada)
   ```bash
   # Di PowerShell
   New-Item -Path .env -ItemType File
   ```

2. **Tambahkan DATABASE_URL ke file `.env`**
   ```env
   # Database
   DATABASE_URL="postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require"
   
   # Backup database lama (opsional, simpan untuk jaga-jaga)
   # DATABASE_URL_OLD="connection_string_database_lama"
   ```

3. **Pastikan `.env` ada di `.gitignore`**
   ```
   .env
   .env.local
   .env*.local
   ```

## Langkah 3: Backup Database Lama (Opsional tapi Disarankan)

Jika Anda memiliki data penting di database lama:

```bash
# Untuk PostgreSQL lokal
pg_dump -U [username] -d [database_name] -f backup.sql

# Atau gunakan tool GUI seperti pgAdmin
```

## Langkah 4: Deploy Schema ke Neon

Ada dua pilihan:

### Opsi A: Reset dan Deploy Fresh (Database Baru/Kosong)

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema ke Neon (akan membuat semua table)
npx prisma db push

# 3. Atau gunakan migrate deploy untuk production
npx prisma migrate deploy
```

### Opsi B: Migrate dengan History (Recommended)

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Deploy semua migration yang ada
npx prisma migrate deploy

# 3. Jika ada error, reset dan deploy ulang
npx prisma migrate reset --force
npx prisma migrate deploy
```

## Langkah 5: Seed Data (Opsional)

Jika Anda memiliki seed data:

```bash
# Jalankan seed script
npx prisma db seed
```

Atau jika ada seed file:
```bash
npx ts-node prisma/seeds/index.ts
```

## Langkah 6: Migrate Data dari Database Lama (Jika Perlu)

Jika Anda perlu memindahkan data dari database lama:

### Menggunakan Prisma Studio

```bash
# 1. Backup data dari database lama
# Edit .env, gunakan DATABASE_URL_OLD
DATABASE_URL="connection_string_database_lama"

# 2. Export data (manual atau script)
# Buat script untuk export data

# 3. Ubah ke Neon connection
DATABASE_URL="neon_connection_string"

# 4. Import data
# Jalankan script import
```

### Menggunakan SQL Dump

```bash
# 1. Export dari database lama
pg_dump -U [username] -d [database_name] -f backup.sql

# 2. Import ke Neon
# Download neonctl atau gunakan connection string
psql "postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require" < backup.sql
```

## Langkah 7: Testing

```bash
# 1. Test koneksi database
npm run dev

# 2. Cek apakah aplikasi berjalan normal

# 3. Test CRUD operations
# - Buat user baru
# - Buat service baru
# - Test semua fitur
```

## Langkah 8: Update Production Environment

Jika deploy ke Vercel/Netlify/dll:

1. **Tambahkan Environment Variable di Platform**
   - Masuk ke dashboard platform (Vercel/Netlify)
   - Tambahkan `DATABASE_URL` dengan Neon connection string
   - Save dan redeploy

2. **Jalankan Migration di Production**
   ```bash
   # Di Vercel, tambahkan build command:
   # package.json
   "scripts": {
     "build": "prisma generate && prisma migrate deploy && next build"
   }
   ```

## Troubleshooting

### Error: "Can't reach database server"
- Pastikan connection string benar
- Pastikan sslmode=require ada di connection string
- Check firewall/network

### Error: "Migration failed"
```bash
# Reset dan coba lagi
npx prisma migrate reset --force
npx prisma migrate deploy
```

### Error: "P1001: Can't connect to database"
- Pastikan Neon project tidak dalam sleep mode
- Neon free tier memiliki auto-sleep setelah 5 menit idle
- Connection pertama mungkin butuh waktu lebih lama

## Tips Penting

1. **Selalu Backup** sebelum migrasi
2. **Test di Development** dulu sebelum production
3. **Simpan Connection String** lama untuk jaga-jaga
4. **Monitor Neon Dashboard** untuk usage dan performance
5. **Free Tier Limits**:
   - 1 project
   - 10 branches
   - 3GB storage
   - Auto-sleep setelah 5 menit idle

## Script Helper (Opsional)

Buat file `migrate-to-neon.sh`:

```bash
#!/bin/bash

echo "🚀 Starting migration to Neon..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Deploy migrations
echo "🔄 Deploying migrations..."
npx prisma migrate deploy

# Seed data (if needed)
# echo "🌱 Seeding database..."
# npx prisma db seed

echo "✅ Migration complete!"
echo "🧪 Please test your application"
```

Untuk Windows PowerShell:
```powershell
# migrate-to-neon.ps1

Write-Host "🚀 Starting migration to Neon..." -ForegroundColor Green

Write-Host "📦 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "🔄 Deploying migrations..." -ForegroundColor Yellow
npx prisma migrate deploy

Write-Host "✅ Migration complete!" -ForegroundColor Green
Write-Host "🧪 Please test your application" -ForegroundColor Cyan
```

## Resources

- Neon Documentation: https://neon.tech/docs
- Prisma Documentation: https://www.prisma.io/docs
- Neon + Prisma Guide: https://neon.tech/docs/guides/prisma
