# Generate PWA Icons

Untuk generate icons PWA dari logo yang ada, Anda bisa menggunakan tools online atau script berikut:

## Option 1: Online Tools
1. Kunjungi https://www.pwabuilder.com/imageGenerator
2. Upload logo.png atau logoo.png
3. Download generated icons
4. Extract ke folder `public/icons/`

## Option 2: Manual dengan Image Editor
Buat icons dengan ukuran berikut dari logo yang ada:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png (wajib, maskable)
- icon-384x384.png
- icon-512x512.png (wajib, maskable)

## Option 3: Menggunakan Sharp (Node.js)
Jalankan script berikut untuk auto-generate dari logo:

```bash
npm install sharp --save-dev
node scripts/generate-icons.js
```

## Catatan
- Icon 192x192 dan 512x512 harus maskable (padding 20% dari setiap sisi)
- Semua icons harus format PNG
- Background harus transparan atau sesuai brand color

