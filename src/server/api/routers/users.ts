import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { UserType } from "@prisma/client";

export const usersRouter = createTRPCRouter({
  // TODO make admin only
  /**
   * Create participants from whitelist
   */
  putParticipantWhitelist: publicProcedure
    .input(
      z.array(
        z.string().trim().email({
          message: "Invalid email",
        })
      )
    )
    .mutation(async ({ ctx, input: participants }) => {
      const queries = participants.map((email) => {
        return ctx.prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            type: UserType.PARTICIPANT,
          },
        });
      });

      await ctx.prisma.$transaction(queries);
    }),

  getUsers: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany();
  }),

  deleteByEmail: publicProcedure
    .input(
      z.string().trim().email({
        message: "Invalid email",
      })
    )
    .mutation(async ({ ctx, input: email }) => {
      await ctx.prisma.user.delete({
        where: { email },
      });
    }),

  promoteToAdmin: publicProcedure
    .input(
      z.string().trim().email({
        message: "Invalid email",
      })
    )
    .mutation(async ({ ctx, input: email }) => {
      await ctx.prisma.user.update({
        where: { email },
        data: { isAdmin: true },
      });
    }),

  promoteToJudge: publicProcedure
    .input(
      z.string().trim().email({
        message: "Invalid email",
      })
    )
    .mutation(async ({ ctx, input: email }) => {
      await ctx.prisma.user.update({
        where: { email },
        data: {
          type: UserType.JUDGE,
          judge: {
            create: {},
          },
        },
      });
    }),
});
