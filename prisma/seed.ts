import { PrismaClient, UserType } from '@prisma/client';
import { generateJWT } from '../src/utils/auth';
const prisma = new PrismaClient();


async function main() {
  // Check if an admin user already exists
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true},
  });

  if (!adminUser) {
    const jwtSecret = process.env.JWT_SECRET as string;
    const email = process.env.ADMIN_EMAIL as string
    const token = generateJWT(email, jwtSecret);
    // Create a new admin user if it doesn't exist
    await prisma.user.create({
      data: {
        email,
        type: UserType.JUDGE,
        isAdmin: true,
      },
    });
    console.log(`Admin user created, token: ${token}`);
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });