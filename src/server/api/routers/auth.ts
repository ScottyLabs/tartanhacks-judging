import { sendMagicLinkEmail } from "../../utils/email";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "../../db";

export const authRouter = createTRPCRouter({
  sendMagicLink: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      const { email } = input;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found. Please verify that your email is correct.",
        };
      }

      try {
        await sendMagicLinkEmail(email);
        return {
          success: true,
          message: "Magic link email sent successfully",
        };
      } catch (error) {
        console.error("Error sending magic link email:", error);
        return {
          success: false,
          message: "Error sending magic link email",
        };
      }
    }),
});
