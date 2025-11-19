import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs' // supaya password di-hash (opsional tapi lebih aman)

const prisma = new PrismaClient()

async function main() {
  const hashedAdminPass = await bcrypt.hash('daffa170805', 10)
  const hashedGuestPass = await bcrypt.hash('pengunjung123', 13)

  // Super admin
  await prisma.user.upsert({
    where: { email: 'admin@memoriesendxyz.online' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@memoriesendxyz.online',
      password: hashedAdminPass,
      role: Role.SUPERADMIN,
    },
  })

  // Default guest
  await prisma.user.upsert({
    where: { email: 'pengunjung@gmail.com' },
    update: {},
    create: {
      name: 'Default Guest',
      email: 'pengunjung@gmail.com',
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
