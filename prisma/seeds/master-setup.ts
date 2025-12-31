import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupAllBrands(brands: string[] = ['Samsung', 'Oppo', 'Xiaomi', 'Vivo', 'Realme', 'iPhone', 'Infinix', 'Tecno', 'Poco', 'Huawei']) {
  console.log('🚀 Starting full phone brands setup...')
  console.log(`📱 Brands to setup: ${brands.join(', ')}`)

  try {
    // STEP 1: Clean existing data
    console.log('\n🧹 Step 1: Cleaning existing data...')
    
    for (const brand of brands) {
      const handphones = await prisma.handphone.findMany({
        where: { brand }
      })

      if (handphones.length > 0) {
        console.log(`\n📱 Cleaning ${brand} (${handphones.length} models)`)

        // Delete services first
        const handphoneIds = handphones.map(hp => hp.id)
        const deletedServices = await prisma.service.deleteMany({
          where: { handphoneId: { in: handphoneIds } }
        })
        console.log(`  🗑️ Deleted ${deletedServices.count} services`)

        // Delete handphones
        for (const hp of handphones) {
          await prisma.handphone.delete({ where: { id: hp.id } })
        }
        console.log(`  ✅ Cleaned ${handphones.length} ${brand} models`)
      }
    }

    // STEP 2: Seed all brands
    console.log('\n🌱 Step 2: Seeding phone data...')

    const allData = {
      Samsung: [
        {
          brand: 'Samsung',
          tipe: 'Galaxy A54 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Samsung Galaxy A54 5G Original', harga: 325000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Samsung Galaxy A54 5G Original', harga: 1850000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Samsung Galaxy A54 5G Original', harga: 165000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Samsung Galaxy A54 5G Original', harga: 145000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Samsung Galaxy A54 5G Original', harga: 185000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Samsung Galaxy A54 5G Original', harga: 850000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Samsung Galaxy A54 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Samsung Galaxy A54 5G', harga: 0 }
          ]
        },
        {
          brand: 'Samsung',
          tipe: 'Galaxy A34 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Samsung Galaxy A34 5G Original', harga: 285000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Samsung Galaxy A34 5G Original', harga: 1450000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Samsung Galaxy A34 5G Original', harga: 145000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Samsung Galaxy A34 5G Original', harga: 125000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Samsung Galaxy A34 5G Original', harga: 165000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Samsung Galaxy A34 5G Original', harga: 650000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Samsung Galaxy A34 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Samsung Galaxy A34 5G', harga: 0 }
          ]
        },
        {
          brand: 'Samsung',
          tipe: 'Galaxy S23 Ultra',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Samsung Galaxy S23 Ultra Original', harga: 550000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Samsung Galaxy S23 Ultra Original', harga: 4200000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Samsung Galaxy S23 Ultra Original', harga: 265000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Samsung Galaxy S23 Ultra Original', harga: 225000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Samsung Galaxy S23 Ultra Original', harga: 275000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Samsung Galaxy S23 Ultra Original', harga: 2100000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Samsung Galaxy S23 Ultra', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Samsung Galaxy S23 Ultra', harga: 0 }
          ]
        },
        {
          brand: 'Samsung',
          tipe: 'Galaxy A14',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Samsung Galaxy A14 Original', harga: 220000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Samsung Galaxy A14 Original', harga: 950000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Samsung Galaxy A14 Original', harga: 115000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Samsung Galaxy A14 Original', harga: 95000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Samsung Galaxy A14 Original', harga: 135000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Samsung Galaxy A14 Original', harga: 425000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Samsung Galaxy A14', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Samsung Galaxy A14', harga: 0 }
          ]
        },
        {
          brand: 'Samsung',
          tipe: 'Galaxy M54 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Samsung Galaxy M54 5G Original', harga: 310000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Samsung Galaxy M54 5G Original', harga: 1650000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Samsung Galaxy M54 5G Original', harga: 155000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Samsung Galaxy M54 5G Original', harga: 135000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Samsung Galaxy M54 5G Original', harga: 175000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Samsung Galaxy M54 5G Original', harga: 750000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Samsung Galaxy M54 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Samsung Galaxy M54 5G', harga: 0 }
          ]
        }
      ],
      Oppo: [
        {
          brand: 'Oppo',
          tipe: 'Reno 8 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Oppo Reno 8 Pro Original', harga: 320000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Oppo Reno 8 Pro Original', harga: 1750000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Oppo Reno 8 Pro Original', harga: 160000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Oppo Reno 8 Pro Original', harga: 140000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Oppo Reno 8 Pro Original', harga: 180000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Oppo Reno 8 Pro Original', harga: 800000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Oppo Reno 8 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Oppo Reno 8 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Oppo',
          tipe: 'A78 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Oppo A78 5G Original', harga: 270000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Oppo A78 5G Original', harga: 1350000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Oppo A78 5G Original', harga: 140000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Oppo A78 5G Original', harga: 120000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Oppo A78 5G Original', harga: 160000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Oppo A78 5G Original', harga: 620000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Oppo A78 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Oppo A78 5G', harga: 0 }
          ]
        },
        {
          brand: 'Oppo',
          tipe: 'Find X5 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Oppo Find X5 Pro Original', harga: 520000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Oppo Find X5 Pro Original', harga: 3950000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Oppo Find X5 Pro Original', harga: 250000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Oppo Find X5 Pro Original', harga: 215000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Oppo Find X5 Pro Original', harga: 265000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Oppo Find X5 Pro Original', harga: 1950000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Oppo Find X5 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Oppo Find X5 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Oppo',
          tipe: 'A17',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Oppo A17 Original', harga: 210000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Oppo A17 Original', harga: 880000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Oppo A17 Original', harga: 110000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Oppo A17 Original', harga: 90000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Oppo A17 Original', harga: 130000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Oppo A17 Original', harga: 400000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Oppo A17', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Oppo A17', harga: 0 }
          ]
        },
        {
          brand: 'Oppo',
          tipe: 'Reno 10 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Oppo Reno 10 5G Original', harga: 305000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Oppo Reno 10 5G Original', harga: 1580000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Oppo Reno 10 5G Original', harga: 150000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Oppo Reno 10 5G Original', harga: 130000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Oppo Reno 10 5G Original', harga: 170000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Oppo Reno 10 5G Original', harga: 720000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Oppo Reno 10 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Oppo Reno 10 5G', harga: 0 }
          ]
        }
      ],
      Xiaomi: [
        {
          brand: 'Xiaomi',
          tipe: 'Redmi Note 12 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Xiaomi Redmi Note 12 Pro Original', harga: 280000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Xiaomi Redmi Note 12 Pro Original', harga: 1380000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Xiaomi Redmi Note 12 Pro Original', harga: 140000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Xiaomi Redmi Note 12 Pro Original', harga: 120000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Xiaomi Redmi Note 12 Pro Original', harga: 155000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Xiaomi Redmi Note 12 Pro Original', harga: 680000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Xiaomi Redmi Note 12 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Xiaomi Redmi Note 12 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Xiaomi',
          tipe: 'Poco X5 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Xiaomi Poco X5 Pro Original', harga: 295000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Xiaomi Poco X5 Pro Original', harga: 1450000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Xiaomi Poco X5 Pro Original', harga: 145000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Xiaomi Poco X5 Pro Original', harga: 125000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Xiaomi Poco X5 Pro Original', harga: 160000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Xiaomi Poco X5 Pro Original', harga: 720000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Xiaomi Poco X5 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Xiaomi Poco X5 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Xiaomi',
          tipe: '13T Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Xiaomi 13T Pro Original', harga: 480000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Xiaomi 13T Pro Original', harga: 2850000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Xiaomi 13T Pro Original', harga: 220000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Xiaomi 13T Pro Original', harga: 195000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Xiaomi 13T Pro Original', harga: 240000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Xiaomi 13T Pro Original', harga: 1550000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Xiaomi 13T Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Xiaomi 13T Pro', harga: 0 }
          ]
        },
        {
          brand: 'Xiaomi',
          tipe: 'Redmi 12',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Xiaomi Redmi 12 Original', harga: 215000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Xiaomi Redmi 12 Original', harga: 920000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Xiaomi Redmi 12 Original', harga: 115000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Xiaomi Redmi 12 Original', harga: 95000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Xiaomi Redmi 12 Original', harga: 130000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Xiaomi Redmi 12 Original', harga: 440000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Xiaomi Redmi 12', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Xiaomi Redmi 12', harga: 0 }
          ]
        },
        {
          brand: 'Xiaomi',
          tipe: 'Redmi Note 11',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Xiaomi Redmi Note 11 Original', harga: 260000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Xiaomi Redmi Note 11 Original', harga: 1180000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Xiaomi Redmi Note 11 Original', harga: 135000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Xiaomi Redmi Note 11 Original', harga: 115000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Xiaomi Redmi Note 11 Original', harga: 150000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Xiaomi Redmi Note 11 Original', harga: 580000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Xiaomi Redmi Note 11', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Xiaomi Redmi Note 11', harga: 0 }
          ]
        }
      ],
      Vivo: [
        {
          brand: 'Vivo',
          tipe: 'V27 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Vivo V27 5G Original', harga: 310000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Vivo V27 5G Original', harga: 1650000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Vivo V27 5G Original', harga: 155000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Vivo V27 5G Original', harga: 135000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Vivo V27 5G Original', harga: 175000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Vivo V27 5G Original', harga: 750000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Vivo V27 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Vivo V27 5G', harga: 0 }
          ]
        },
        {
          brand: 'Vivo',
          tipe: 'Y36',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Vivo Y36 Original', harga: 240000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Vivo Y36 Original', harga: 1050000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Vivo Y36 Original', harga: 125000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Vivo Y36 Original', harga: 105000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Vivo Y36 Original', harga: 140000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Vivo Y36 Original', harga: 520000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Vivo Y36', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Vivo Y36', harga: 0 }
          ]
        },
        {
          brand: 'Vivo',
          tipe: 'X90 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Vivo X90 Pro Original', harga: 560000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Vivo X90 Pro Original', harga: 4100000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Vivo X90 Pro Original', harga: 270000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Vivo X90 Pro Original', harga: 230000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Vivo X90 Pro Original', harga: 280000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Vivo X90 Pro Original', harga: 2200000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Vivo X90 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Vivo X90 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Vivo',
          tipe: 'Y27',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Vivo Y27 Original', harga: 205000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Vivo Y27 Original', harga: 860000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Vivo Y27 Original', harga: 105000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Vivo Y27 Original', harga: 85000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Vivo Y27 Original', harga: 125000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Vivo Y27 Original', harga: 380000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Vivo Y27', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Vivo Y27', harga: 0 }
          ]
        },
        {
          brand: 'Vivo',
          tipe: 'V25 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Vivo V25 Pro Original', harga: 285000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Vivo V25 Pro Original', harga: 1420000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Vivo V25 Pro Original', harga: 145000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Vivo V25 Pro Original', harga: 125000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Vivo V25 Pro Original', harga: 165000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Vivo V25 Pro Original', harga: 680000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Vivo V25 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Vivo V25 Pro', harga: 0 }
          ]
        }
      ],
      Realme: [
        {
          brand: 'Realme',
          tipe: 'GT 2 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Realme GT 2 Pro Original', harga: 450000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Realme GT 2 Pro Original', harga: 2650000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Realme GT 2 Pro Original', harga: 210000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Realme GT 2 Pro Original', harga: 185000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Realme GT 2 Pro Original', harga: 230000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Realme GT 2 Pro Original', harga: 1420000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Realme GT 2 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Realme GT 2 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Realme',
          tipe: '11 Pro Plus',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Realme 11 Pro Plus Original', harga: 295000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Realme 11 Pro Plus Original', harga: 1520000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Realme 11 Pro Plus Original', harga: 150000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Realme 11 Pro Plus Original', harga: 130000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Realme 11 Pro Plus Original', harga: 170000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Realme 11 Pro Plus Original', harga: 740000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Realme 11 Pro Plus', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Realme 11 Pro Plus', harga: 0 }
          ]
        },
        {
          brand: 'Realme',
          tipe: 'C55',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Realme C55 Original', harga: 200000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Realme C55 Original', harga: 840000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Realme C55 Original', harga: 100000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Realme C55 Original', harga: 80000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Realme C55 Original', harga: 120000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Realme C55 Original', harga: 360000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Realme C55', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Realme C55', harga: 0 }
          ]
        },
        {
          brand: 'Realme',
          tipe: 'Narzo 60 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Realme Narzo 60 Pro Original', harga: 270000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Realme Narzo 60 Pro Original', harga: 1320000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Realme Narzo 60 Pro Original', harga: 135000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Realme Narzo 60 Pro Original', harga: 115000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Realme Narzo 60 Pro Original', harga: 155000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Realme Narzo 60 Pro Original', harga: 640000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Realme Narzo 60 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Realme Narzo 60 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Realme',
          tipe: '10 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Realme 10 Pro Original', harga: 255000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Realme 10 Pro Original', harga: 1150000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Realme 10 Pro Original', harga: 130000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Realme 10 Pro Original', harga: 110000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Realme 10 Pro Original', harga: 145000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Realme 10 Pro Original', harga: 560000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Realme 10 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Realme 10 Pro', harga: 0 }
          ]
        }
      ],
      iPhone: [
        {
          brand: 'iPhone',
          tipe: '14 Pro Max',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai iPhone 14 Pro Max Original', harga: 1250000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD iPhone 14 Pro Max Original', harga: 7500000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic iPhone 14 Pro Max Original', harga: 450000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker iPhone 14 Pro Max Original', harga: 380000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume iPhone 14 Pro Max Original', harga: 520000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera iPhone 14 Pro Max Original', harga: 3800000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang iPhone 14 Pro Max', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa iPhone 14 Pro Max', harga: 0 }
          ]
        },
        {
          brand: 'iPhone',
          tipe: '13',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai iPhone 13 Original', harga: 950000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD iPhone 13 Original', harga: 5200000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic iPhone 13 Original', harga: 380000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker iPhone 13 Original', harga: 320000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume iPhone 13 Original', harga: 420000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera iPhone 13 Original', harga: 2800000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang iPhone 13', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa iPhone 13', harga: 0 }
          ]
        },
        {
          brand: 'iPhone',
          tipe: '12',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai iPhone 12 Original', harga: 850000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD iPhone 12 Original', harga: 4200000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic iPhone 12 Original', harga: 350000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker iPhone 12 Original', harga: 295000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume iPhone 12 Original', harga: 380000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera iPhone 12 Original', harga: 2400000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang iPhone 12', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa iPhone 12', harga: 0 }
          ]
        },
        {
          brand: 'iPhone',
          tipe: '11',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai iPhone 11 Original', harga: 720000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD iPhone 11 Original', harga: 3500000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic iPhone 11 Original', harga: 320000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker iPhone 11 Original', harga: 270000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume iPhone 11 Original', harga: 340000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera iPhone 11 Original', harga: 1980000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang iPhone 11', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa iPhone 11', harga: 0 }
          ]
        },
        {
          brand: 'iPhone',
          tipe: 'SE 2022',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai iPhone SE 2022 Original', harga: 650000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD iPhone SE 2022 Original', harga: 2800000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic iPhone SE 2022 Original', harga: 280000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker iPhone SE 2022 Original', harga: 240000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume iPhone SE 2022 Original', harga: 310000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera iPhone SE 2022 Original', harga: 1620000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang iPhone SE 2022', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa iPhone SE 2022', harga: 0 }
          ]
        }
      ],
      Infinix: [
        {
          brand: 'Infinix',
          tipe: 'Note 30 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Infinix Note 30 Pro Original', harga: 235000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Infinix Note 30 Pro Original', harga: 980000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Infinix Note 30 Pro Original', harga: 120000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Infinix Note 30 Pro Original', harga: 100000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Infinix Note 30 Pro Original', harga: 135000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Infinix Note 30 Pro Original', harga: 480000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Infinix Note 30 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Infinix Note 30 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Infinix',
          tipe: 'Hot 30i',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Infinix Hot 30i Original', harga: 195000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Infinix Hot 30i Original', harga: 780000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Infinix Hot 30i Original', harga: 95000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Infinix Hot 30i Original', harga: 75000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Infinix Hot 30i Original', harga: 115000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Infinix Hot 30i Original', harga: 340000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Infinix Hot 30i', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Infinix Hot 30i', harga: 0 }
          ]
        },
        {
          brand: 'Infinix',
          tipe: 'Zero 30 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Infinix Zero 30 5G Original', harga: 280000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Infinix Zero 30 5G Original', harga: 1380000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Infinix Zero 30 5G Original', harga: 140000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Infinix Zero 30 5G Original', harga: 120000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Infinix Zero 30 5G Original', harga: 160000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Infinix Zero 30 5G Original', harga: 680000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Infinix Zero 30 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Infinix Zero 30 5G', harga: 0 }
          ]
        },
        {
          brand: 'Infinix',
          tipe: 'Smart 7',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Infinix Smart 7 Original', harga: 180000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Infinix Smart 7 Original', harga: 680000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Infinix Smart 7 Original', harga: 85000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Infinix Smart 7 Original', harga: 65000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Infinix Smart 7 Original', harga: 105000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Infinix Smart 7 Original', harga: 290000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Infinix Smart 7', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Infinix Smart 7', harga: 0 }
          ]
        },
        {
          brand: 'Infinix',
          tipe: 'Note 12 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Infinix Note 12 Pro Original', harga: 220000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Infinix Note 12 Pro Original', harga: 920000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Infinix Note 12 Pro Original', harga: 110000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Infinix Note 12 Pro Original', harga: 90000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Infinix Note 12 Pro Original', harga: 125000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Infinix Note 12 Pro Original', harga: 440000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Infinix Note 12 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Infinix Note 12 Pro', harga: 0 }
          ]
        }
      ],
      Tecno: [
        {
          brand: 'Tecno',
          tipe: 'Camon 20 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Tecno Camon 20 Pro Original', harga: 250000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Tecno Camon 20 Pro Original', harga: 1080000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Tecno Camon 20 Pro Original', harga: 125000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Tecno Camon 20 Pro Original', harga: 105000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Tecno Camon 20 Pro Original', harga: 140000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Tecno Camon 20 Pro Original', harga: 520000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Tecno Camon 20 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Tecno Camon 20 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Tecno',
          tipe: 'Spark 10 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Tecno Spark 10 Pro Original', harga: 210000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Tecno Spark 10 Pro Original', harga: 880000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Tecno Spark 10 Pro Original', harga: 105000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Tecno Spark 10 Pro Original', harga: 85000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Tecno Spark 10 Pro Original', harga: 125000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Tecno Spark 10 Pro Original', harga: 400000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Tecno Spark 10 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Tecno Spark 10 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Tecno',
          tipe: 'Phantom X2',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Tecno Phantom X2 Original', harga: 420000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Tecno Phantom X2 Original', harga: 2480000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Tecno Phantom X2 Original', harga: 195000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Tecno Phantom X2 Original', harga: 170000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Tecno Phantom X2 Original', harga: 215000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Tecno Phantom X2 Original', harga: 1320000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Tecno Phantom X2', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Tecno Phantom X2', harga: 0 }
          ]
        },
        {
          brand: 'Tecno',
          tipe: 'Pop 7 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Tecno Pop 7 Pro Original', harga: 175000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Tecno Pop 7 Pro Original', harga: 650000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Tecno Pop 7 Pro Original', harga: 80000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Tecno Pop 7 Pro Original', harga: 60000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Tecno Pop 7 Pro Original', harga: 100000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Tecno Pop 7 Pro Original', harga: 270000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Tecno Pop 7 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Tecno Pop 7 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Tecno',
          tipe: 'Pova 5 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Tecno Pova 5 Pro Original', harga: 240000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Tecno Pova 5 Pro Original', harga: 1020000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Tecno Pova 5 Pro Original', harga: 120000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Tecno Pova 5 Pro Original', harga: 100000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Tecno Pova 5 Pro Original', harga: 135000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Tecno Pova 5 Pro Original', harga: 490000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Tecno Pova 5 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Tecno Pova 5 Pro', harga: 0 }
          ]
        }
      ],
      Poco: [
        {
          brand: 'Poco',
          tipe: 'F5 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Poco F5 Pro Original', harga: 340000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Poco F5 Pro Original', harga: 1880000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Poco F5 Pro Original', harga: 170000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Poco F5 Pro Original', harga: 150000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Poco F5 Pro Original', harga: 190000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Poco F5 Pro Original', harga: 920000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Poco F5 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Poco F5 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Poco',
          tipe: 'X5 Pro 5G',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Poco X5 Pro 5G Original', harga: 285000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Poco X5 Pro 5G Original', harga: 1420000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Poco X5 Pro 5G Original', harga: 140000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Poco X5 Pro 5G Original', harga: 120000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Poco X5 Pro 5G Original', harga: 155000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Poco X5 Pro 5G Original', harga: 680000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Poco X5 Pro 5G', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Poco X5 Pro 5G', harga: 0 }
          ]
        },
        {
          brand: 'Poco',
          tipe: 'M5s',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Poco M5s Original', harga: 230000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Poco M5s Original', harga: 1020000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Poco M5s Original', harga: 115000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Poco M5s Original', harga: 95000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Poco M5s Original', harga: 135000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Poco M5s Original', harga: 490000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Poco M5s', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Poco M5s', harga: 0 }
          ]
        },
        {
          brand: 'Poco',
          tipe: 'C55',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Poco C55 Original', harga: 195000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Poco C55 Original', harga: 820000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Poco C55 Original', harga: 100000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Poco C55 Original', harga: 80000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Poco C55 Original', harga: 120000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Poco C55 Original', harga: 380000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Poco C55', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Poco C55', harga: 0 }
          ]
        },
        {
          brand: 'Poco',
          tipe: 'X4 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Poco X4 Pro Original', harga: 260000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Poco X4 Pro Original', harga: 1250000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Poco X4 Pro Original', harga: 130000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Poco X4 Pro Original', harga: 110000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Poco X4 Pro Original', harga: 145000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Poco X4 Pro Original', harga: 590000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Poco X4 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Poco X4 Pro', harga: 0 }
          ]
        }
      ],
      Huawei: [
        {
          brand: 'Huawei',
          tipe: 'Nova 11',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Huawei Nova 11 Original', harga: 315000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Huawei Nova 11 Original', harga: 1680000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Huawei Nova 11 Original', harga: 160000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Huawei Nova 11 Original', harga: 140000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Huawei Nova 11 Original', harga: 180000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Huawei Nova 11 Original', harga: 780000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Huawei Nova 11', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Huawei Nova 11', harga: 0 }
          ]
        },
        {
          brand: 'Huawei',
          tipe: 'P60 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Huawei P60 Pro Original', harga: 580000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Huawei P60 Pro Original', harga: 4350000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Huawei P60 Pro Original', harga: 280000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Huawei P60 Pro Original', harga: 240000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Huawei P60 Pro Original', harga: 290000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Huawei P60 Pro Original', harga: 2350000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Huawei P60 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Huawei P60 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Huawei',
          tipe: 'Mate 50 Pro',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Huawei Mate 50 Pro Original', harga: 550000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Huawei Mate 50 Pro Original', harga: 4180000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Huawei Mate 50 Pro Original', harga: 270000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Huawei Mate 50 Pro Original', harga: 230000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Huawei Mate 50 Pro Original', harga: 280000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Huawei Mate 50 Pro Original', harga: 2180000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Huawei Mate 50 Pro', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Huawei Mate 50 Pro', harga: 0 }
          ]
        },
        {
          brand: 'Huawei',
          tipe: 'Nova Y91',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Huawei Nova Y91 Original', harga: 235000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Huawei Nova Y91 Original', harga: 980000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Huawei Nova Y91 Original', harga: 120000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Huawei Nova Y91 Original', harga: 100000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Huawei Nova Y91 Original', harga: 135000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Huawei Nova Y91 Original', harga: 480000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Huawei Nova Y91', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Huawei Nova Y91', harga: 0 }
          ]
        },
        {
          brand: 'Huawei',
          tipe: 'Y9a',
          kendalas: [
            { masalah: 'Ganti Baterai', sparepart: 'Baterai Huawei Y9a Original', harga: 255000 },
            { masalah: 'Ganti LCD', sparepart: 'LCD Huawei Y9a Original', harga: 1150000 },
            { masalah: 'Ganti Mic', sparepart: 'Mic Huawei Y9a Original', harga: 130000 },
            { masalah: 'Ganti Speaker', sparepart: 'Speaker Huawei Y9a Original', harga: 110000 },
            { masalah: 'Ganti Tombol Power dan Volume', sparepart: 'Tombol Power dan Volume Huawei Y9a Original', harga: 145000 },
            { masalah: 'Ganti Kamera', sparepart: 'Kamera Huawei Y9a Original', harga: 560000 },
            { masalah: 'Install Ulang', sparepart: 'Service Install Ulang Huawei Y9a', harga: 0 },
            { masalah: 'Handphone Tidak Bisa Menyala', sparepart: 'Service Diagnosa Huawei Y9a', harga: 0 }
          ]
        }
      ]
    }

    let grandTotal = { models: 0, kendala: 0, spareparts: 0 }

    for (const brand of brands) {
      const brandData = allData[brand as keyof typeof allData]
      if (!brandData) {
        console.log(`\n⚠️ No data found for brand: ${brand}`)
        continue
      }

      console.log(`\n📱 Seeding ${brand}...`)
      let brandTotal = { models: 0, kendala: 0, spareparts: 0 }

      for (const model of brandData) {
        const handphone = await prisma.handphone.create({
          data: {
            brand: model.brand,
            tipe: model.tipe
          }
        })
        brandTotal.models++

        for (const kendalaData of model.kendalas) {
          const kendala = await prisma.kendalaHandphone.create({
            data: {
              topikMasalah: kendalaData.masalah,
              handphoneId: handphone.id
            }
          })
          brandTotal.kendala++

          await prisma.pergantianBarang.create({
            data: {
              namaBarang: kendalaData.sparepart,
              harga: kendalaData.harga,
              kendalaHandphoneId: kendala.id
            }
          })
          brandTotal.spareparts++
        }

        console.log(`  ✅ ${model.tipe} (${model.kendalas.length} kendala)`)
      }

      console.log(`  📊 ${brand}: ${brandTotal.models} models, ${brandTotal.kendala} kendala, ${brandTotal.spareparts} spareparts`)
      grandTotal.models += brandTotal.models
      grandTotal.kendala += brandTotal.kendala
      grandTotal.spareparts += brandTotal.spareparts
    }

    console.log('\n🎉 All brands setup completed successfully!')
    console.log('\n📋 Grand Total:')
    console.log(`- Total Models: ${grandTotal.models}`)
    console.log(`- Total Kendala: ${grandTotal.kendala}`)
    console.log(`- Total Spare Parts: ${grandTotal.spareparts}`)
    console.log('\n✨ Database is ready for production!')

  } catch (error) {
    console.error('❌ Setup error:', error)
    throw error
  }
}

// Setup all brands (Samsung & Oppo)
setupAllBrands()
  .catch((e) => {
    console.error('❌ Setup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
