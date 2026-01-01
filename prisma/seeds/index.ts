import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  try {
    // Hash password untuk admin
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: 'bukhariservicec@gmail.com' },
      update: {},
      create: {
        email: 'bukhariservicec@gmail.com',
        name: 'Bukhari Admin',
        password: hashedPassword,
        phoneNumber: '+62812-3456-7890',
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin user created:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    })

    // Create Sample Customer Users
    const customerUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
          email: 'john.doe@example.com',
          name: 'John Doe',
          password: await bcrypt.hash('customer123', 12),
          phoneNumber: '+62812-1111-1111',
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          password: await bcrypt.hash('customer123', 12),
          phoneNumber: '+62812-2222-2222',
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'mike.wilson@example.com' },
        update: {},
        create: {
          email: 'mike.wilson@example.com',
          name: 'Mike Wilson',
          password: await bcrypt.hash('customer123', 12),
          phoneNumber: '+62812-3333-3333',
          role: 'USER'
        }
      })
    ])

    console.log('✅ Customer users created:', customerUsers.length)

    console.log('🎉 Seed completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log(`- Admin users: 1`)
    console.log(`- Customer users: ${customerUsers.length}`)
    console.log('')
    console.log('🔐 Login credentials:')
    console.log('Admin: bukhariservicec@gmail.com / admin123')
    console.log('Customer: john.doe@example.com / customer123')

  } catch (error) {
    console.error('❌ Seed error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })