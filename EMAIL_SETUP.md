# Setup Notifikasi Email - Step by Step

## 📋 Overview
Fitur notifikasi email memungkinkan admin untuk mengirim email kepada user kapan saja melalui dashboard admin.

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies
Dependencies sudah terinstall:
- ✅ `resend` - Library untuk mengirim email

### Step 2: Setup Resend Account

1. **Daftar di Resend**
   - Kunjungi: https://resend.com
   - Buat akun gratis (free tier: 3,000 email/bulan)
   - Verifikasi email Anda

2. **Buat API Key**
   - Login ke dashboard Resend
   - Pergi ke **API Keys** di sidebar
   - Klik **Create API Key**
   - Beri nama: `Bukhari Service Center`
   - Copy API key yang dihasilkan (hanya muncul sekali!)

3. **Verifikasi Domain (Opsional untuk Production)**
   - Untuk development, Anda bisa menggunakan domain default Resend
   - Untuk production, verifikasi domain Anda di Resend

### Step 3: Setup Environment Variables

1. **Buat/Edit file `.env.local`** di root project:
   ```env
   # Resend Email Configuration
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL="Bukhari Service Center <noreply@bukhariservicecenter.com>"
   ```

2. **Ganti `re_your_api_key_here`** dengan API key yang Anda dapatkan dari Resend

3. **Untuk Development**, Anda bisa menggunakan email default Resend:
   ```env
   RESEND_FROM_EMAIL="Bukhari Service Center <onboarding@resend.dev>"
   ```

### Step 4: Restart Development Server

Setelah menambahkan environment variables, restart server:
```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

### Step 5: Test Email

1. **Login sebagai Admin**
   - Buka aplikasi di browser
   - Login dengan akun admin

2. **Akses Fitur Email**
   - Di Admin Dashboard, klik tab **"Kirim Email"**
   - Form email akan muncul

3. **Kirim Test Email**
   - Pilih "Input Email Manual"
   - Masukkan email Anda sendiri
   - Subject: "Test Email"
   - Message: "Ini adalah test email dari Bukhari Service Center"
   - Klik **"Kirim Email"**

4. **Cek Email**
   - Buka inbox email yang Anda masukkan
   - Email akan datang dalam beberapa detik

## 📧 Cara Menggunakan Fitur Email

### Di Admin Dashboard:

1. **Login sebagai Admin**
   - Pastikan Anda login dengan role ADMIN

2. **Buka Tab "Kirim Email"**
   - Di Admin Dashboard, klik tab **"Kirim Email"**

3. **Pilih Penerima**
   - **Pilih dari User**: Pilih user dari dropdown (otomatis mengambil email dan nama)
   - **Input Email Manual**: Masukkan email secara manual

4. **Isi Form**
   - **Subject**: Judul email (wajib)
   - **Isi Pesan**: Konten email (wajib)
   - Pesan bisa menggunakan baris baru untuk paragraf

5. **Kirim Email**
   - Klik tombol **"Kirim Email"**
   - Tunggu konfirmasi sukses
   - Email akan terkirim dalam beberapa detik

## 🎨 Template Email

Email yang dikirim menggunakan template HTML yang sudah disediakan dengan:
- ✅ Header dengan logo dan nama aplikasi
- ✅ Konten yang rapi dan mudah dibaca
- ✅ Footer dengan informasi kontak
- ✅ Responsive design (mobile-friendly)
- ✅ Styling yang profesional

## 🔧 Troubleshooting

### Email tidak terkirim?

1. **Cek API Key**
   - Pastikan `RESEND_API_KEY` di `.env.local` sudah benar
   - Pastikan tidak ada spasi atau karakter tambahan

2. **Cek Console Log**
   - Buka browser console (F12)
   - Cek apakah ada error saat mengirim email
   - Error akan muncul di console

3. **Cek Resend Dashboard**
   - Login ke Resend dashboard
   - Cek tab **Logs** untuk melihat status pengiriman
   - Cek apakah ada error dari Resend

4. **Cek Spam Folder**
   - Email mungkin masuk ke spam folder
   - Untuk development, gunakan email yang terpercaya

### Error: "RESEND_API_KEY tidak ditemukan"

- Pastikan file `.env.local` ada di root project
- Pastikan variable `RESEND_API_KEY` sudah diisi
- Restart development server setelah menambahkan env variable

### Error: "Unauthorized" atau "Forbidden"

- Pastikan Anda login sebagai ADMIN
- Cek apakah token authentication masih valid
- Coba logout dan login ulang

## 📝 File yang Dibuat

1. **`src/lib/email.ts`**
   - Utility function untuk mengirim email
   - Template email HTML

2. **`src/app/api/email/send/route.ts`**
   - API endpoint untuk mengirim email
   - Hanya bisa diakses oleh ADMIN

3. **`src/components/EmailSender.tsx`**
   - Komponen UI untuk form kirim email
   - Terintegrasi dengan admin dashboard

4. **`src/app/admin/page.tsx`** (Updated)
   - Menambahkan tab "Kirim Email"
   - Mengintegrasikan EmailSender component

## 🔐 Security

- ✅ Hanya ADMIN yang bisa mengirim email
- ✅ Authentication menggunakan JWT token
- ✅ Validasi input (email format, required fields)
- ✅ API key disimpan di environment variables (tidak di commit ke git)

## 💡 Tips

1. **Untuk Production:**
   - Verifikasi domain di Resend untuk meningkatkan deliverability
   - Gunakan email domain sendiri (bukan @resend.dev)
   - Setup SPF dan DKIM records

2. **Template Custom:**
   - Edit file `src/lib/email.ts`
   - Modifikasi function `createEmailTemplate()` untuk mengubah desain email

3. **Bulk Email:**
   - Saat ini fitur mengirim ke satu user per kali
   - Untuk bulk email, bisa dikembangkan lebih lanjut dengan loop

## 📚 Resources

- Resend Documentation: https://resend.com/docs
- Resend Dashboard: https://resend.com/emails
- Resend API Reference: https://resend.com/docs/api-reference

---

**Selamat! Fitur notifikasi email sudah siap digunakan! 🎉**

