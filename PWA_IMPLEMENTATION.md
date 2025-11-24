# PWA Implementation Guide - Bukhari Service Center

## ✅ Implementasi Selesai

Semua komponen PWA telah berhasil diimplementasikan untuk Next.js 15 dengan App Router.

## 📁 File yang Dibuat/Dimodifikasi

### File Baru:
1. `public/manifest.json` - Web App Manifest
2. `public/sw.js` - Service Worker untuk offline support
3. `public/icons/*` - Icons PWA dalam berbagai ukuran
4. `src/components/PWAInstaller.tsx` - Komponen untuk install prompt
5. `scripts/generate-icons.js` - Script untuk generate icons
6. `scripts/generate-icons.md` - Dokumentasi generate icons

### File yang Dimodifikasi:
1. `next.config.ts` - Konfigurasi PWA
2. `src/app/layout.tsx` - Metadata PWA
3. `src/middleware.ts` - Exclude PWA files dari middleware
4. `package.json` - Dependencies workbox

## 🧪 Testing PWA

### 1. Build Production
```bash
npm run build
npm run start
```

### 2. Test Install Prompt
1. Buka aplikasi di browser (Chrome/Edge recommended)
2. Tunggu beberapa detik, tombol "Install App" akan muncul di pojok kanan bawah
3. Klik tombol untuk install
4. Atau gunakan menu browser: Chrome → Install App

### 3. Test Offline Mode
1. Install aplikasi terlebih dahulu
2. Buka aplikasi yang sudah terinstall
3. Buka DevTools (F12) → Network tab
4. Enable "Offline" checkbox
5. Refresh aplikasi - seharusnya masih bisa diakses (dari cache)

### 4. Lighthouse PWA Audit
1. Buka aplikasi di Chrome
2. Buka DevTools (F12) → Lighthouse tab
3. Pilih "Progressive Web App"
4. Klik "Generate report"
5. Target score: 90+ untuk semua kriteria

### 5. Test Service Worker
1. Buka DevTools (F12) → Application tab
2. Klik "Service Workers" di sidebar
3. Pastikan service worker terdaftar dan aktif
4. Test update: Edit `public/sw.js`, rebuild, dan cek update

## 📋 Checklist PWA Requirements

- ✅ Web App Manifest (`manifest.json`)
- ✅ Service Worker (`sw.js`)
- ✅ HTTPS (required untuk production)
- ✅ Icons (192x192, 512x512 minimum)
- ✅ Theme color
- ✅ Start URL
- ✅ Display mode (standalone)
- ✅ Offline support
- ✅ Install prompt

## 🎨 Customization

### Theme Color
Edit di `src/app/layout.tsx`:
```typescript
themeColor: "#1e40af", // Ganti dengan warna brand Anda
```

Dan di `public/manifest.json`:
```json
"theme_color": "#1e40af",
"background_color": "#0f172a",
```

### Icons
Regenerate icons dengan:
```bash
node scripts/generate-icons.js
```

### Service Worker Caching
Edit `public/sw.js` untuk menyesuaikan caching strategy:
- `PRECACHE_ASSETS` - Assets yang di-cache saat install
- `RUNTIME_CACHE` - Assets yang di-cache saat runtime

## 🐛 Troubleshooting

### Service Worker Tidak Terdaftar
1. Pastikan aplikasi dijalankan di HTTPS (atau localhost)
2. Clear cache dan reload
3. Cek console untuk error messages

### Install Prompt Tidak Muncul
1. Pastikan semua requirements PWA terpenuhi
2. Aplikasi harus diakses minimal 2 kali
3. Pastikan tidak dalam mode incognito
4. Cek di DevTools → Application → Manifest

### Icons Tidak Muncul
1. Pastikan icons ada di `public/icons/`
2. Cek path di `manifest.json` sesuai dengan lokasi file
3. Regenerate icons jika perlu

## 📱 Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari iOS 11.3+
- ✅ Firefox (partial support)
- ⚠️ Safari Desktop (limited support)

## 🚀 Deployment

1. Pastikan domain menggunakan HTTPS
2. Build production: `npm run build`
3. Deploy ke hosting (Vercel, Netlify, dll)
4. Test PWA setelah deployment

## 📚 Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

