import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  putWhitelists: publicProcedure
    .input(
      z.object({
        participants: z.array(
          z.string().trim().email({
            message: "Invalid participant email",
          })
        ),
        judges: z.array(
          z.string().trim().email({
            message: "Invalid judge email",
          })
        ),
        admins: z.array(
          z.string().trim().email({
            message: "Invalid admin email",
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { participants, judges, admins } = input;
      const participantQuery = participants.map((email) => {
        return ctx.prisma.user.upsert({
          where: { email },
          update: {
            type: "PARTICIPANT",
          },
          create: {
            email,
            type: "PARTICIPANT",
          },
        });
      });
      const judgeQuery = judges.map((email) => {
        return ctx.prisma.user.upsert({
          where: { email },
          update: {
            type: "JUDGE",
          },
          create: {
            email,
            type: "JUDGE",
          },
        });
      });
      const adminQuery = admins.map((email) => {
        return ctx.prisma.user.upsert({
          where: { email },
          update: {
            isAdmin: true,
          },
          create: {
            email,
            type: "JUDGE",
            isAdmin: true,
          },
        });
      });
      const result = ctx.prisma.$transaction([
        ...participantQuery,
        ...judgeQuery,
        ...adminQuery,
      ]);
      return await result;
    }),
});