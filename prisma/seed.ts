import { PrismaClient, Settings, UserType } from "@prisma/client";
import { sendMagicLinkEmail } from "../src/server/utils/email";
import { env } from "../src/env/server.mjs";

const prisma = new PrismaClient();

async function main() {
  // Check if an admin user already exists
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true, email: env.ADMIN_EMAIL },
  });

  if (!adminUser) {
    const email = env.ADMIN_EMAIL;
    // Create a new admin user if it doesn't exist
    await prisma.user.create({
      data: {
        email,
        type: UserType.JUDGE,
        isAdmin: true,
      },
    });
    await sendMagicLinkEmail(email);
    console.log(
      `Admin user created, check the provided admin email (${email}) for the magic link to sign in.`
    );
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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
