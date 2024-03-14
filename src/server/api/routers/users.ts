import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  // TODO make admin only
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
            isAdmin: false,
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
            isAdmin: false,
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

  getUsers: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany();
  }),

  deleteByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().trim().email({
          message: "Invalid email",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      return await ctx.prisma.user.delete({
        where: { email },
      });
    }),
});
