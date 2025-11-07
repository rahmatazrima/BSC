/**
 * Test Database Connection Script
 * Jalankan: node test-database-connection.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test 1: Cek koneksi database
    console.log('Test 1: Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Test 2: Cek jumlah data di setiap tabel
    console.log('Test 2: Checking tables...\n');

    const userCount = await prisma.user.count();
    console.log(`📊 Users: ${userCount} records`);

    const sparepartCount = await prisma.pergantianBarang.count();
    console.log(`🔧 Sparepart (PergantianBarang): ${sparepartCount} records`);

    const kendalaCount = await prisma.kendalaHandphone.count();
    console.log(`⚠️  Kendala Handphone: ${kendalaCount} records`);

    const handphoneCount = await prisma.handphone.count();
    console.log(`📱 Handphone: ${handphoneCount} records`);

    const waktuCount = await prisma.waktu.count();
    console.log(`⏰ Waktu/Shift: ${waktuCount} records`);

    const serviceCount = await prisma.service.count();
    console.log(`📋 Service: ${serviceCount} records\n`);

    // Test 3: Cek admin user
    console.log('Test 3: Checking admin users...');
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });

    if (admins.length > 0) {
      console.log(`✅ Found ${admins.length} admin user(s):`);
      admins.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email})`);
      });
    } else {
      console.log('⚠️  No admin users found. Create one to access admin panel!');
    }

    console.log('\n✅ All tests passed! Database is working properly.\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Login as admin');
    console.log('   3. Access: http://localhost:3000/admin/master-data');
    console.log('   4. Start adding master data!\n');

  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error details:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if PostgreSQL is running');
    console.error('   2. Verify DATABASE_URL in .env file');
    console.error('   3. Make sure database exists');
    console.error('   4. Check username and password');
    console.error('   5. Run: npx prisma migrate dev\n');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

