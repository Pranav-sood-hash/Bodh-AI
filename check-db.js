import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const otps = await prisma.oTP.findMany();
  console.log("OTPs in DB:", otps);
  
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.map(u => ({ email: u.email, isVerified: u.isEmailVerified })));
}

check().finally(() => prisma.$disconnect());
