import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs' // supaya password di-hash (opsional tapi lebih aman)

const prisma = new PrismaClient()

async function main() {
  const hashedAdminPass = await bcrypt.hash('admin123', 10)
  const hashedGuestPass = await bcrypt.hash('guest123', 10)

  // Super admin
  await prisma.user.upsert({
    where: { email: 'admin@photobooth.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@photobooth.com',
      password: hashedAdminPass,
      role: Role.SUPERADMIN,
    },
  })

  // Default guest
  await prisma.user.upsert({
    where: { email: 'guest@photobooth.com' },
    update: {},
    create: {
      name: 'Default Guest',
      email: 'guest@photobooth.com',
      password: hashedGuestPass,
      role: Role.GUEST,
    },
  })

  console.log("✅ Seeding berhasil!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
