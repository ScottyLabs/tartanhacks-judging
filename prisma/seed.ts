import { PrismaClient, UserType } from "@prisma/client";
import { generateJWT } from "../src/utils/auth";
import { sendMagicLinkEmail } from "../src/server/utils/email";
import { env } from "../src/env/server.mjs";

const prisma = new PrismaClient();

async function main() {
  // Check if an admin user already exists
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  });

  if (!adminUser) {
    const jwtSecret = env.JWT_SECRET;
    const email = env.ADMIN_EMAIL;
    const token = generateJWT(email, jwtSecret);
    // Create a new admin user if it doesn't exist
    await prisma.user.create({
      data: {
        email,
        type: UserType.JUDGE,
        isAdmin: true,
      },
    });
    await sendMagicLinkEmail(email);
    console.log(`Admin user created, token: ${token}`);
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch((e) => console.error(e))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
