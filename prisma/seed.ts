import { PrismaClient, Settings, UserType } from "@prisma/client";
import { generateJWT } from "../src/utils/auth";
import { sendPlaintextEmail } from "../src/server/utils/email";
import { env } from "../src/env/server.mjs";

const prisma = new PrismaClient();

async function main() {
  // Check if an admin user already exists
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  });

  if (!adminUser) {
    const jwtSecret = process.env.JWT_SECRET as string;
    const email = process.env.ADMIN_EMAIL as string;
    const token = generateJWT(email, jwtSecret);
    // Create a new admin user if it doesn't exist
    await prisma.user.create({
      data: {
        email,
        type: UserType.JUDGE,
        isAdmin: true,
      },
    });
    await sendPlaintextEmail(
      [email],
      "Admin user created",
      `Your admin token is: ${token}`
    );
    console.log(`Admin user created, token: ${token}`);
  } else {
    console.log("Admin user already exists");
  }

  const settings = await prisma.settings.findFirst();

  if (!settings) {
    const defaultSettings = {
      authMode: "LOCAL",
      authUrl: "",
      judgingDeadline: new Date(),
      minVisits: 0,
      sigmaInit: 1.0,
      getTeamUrl: "",
      serviceToken: "",
    } as Settings;

    await prisma?.settings.create({
      data: defaultSettings,
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
