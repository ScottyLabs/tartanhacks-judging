import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { UserType } from "@prisma/client";
import { syncJudgePrizes } from "./judgePrizeUtils";

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
    const users = await ctx.prisma.user.findMany();
    return users.sort((a, b) => a.email.localeCompare(b.email));
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
      const user = await ctx.prisma.user.update({
        where: { email },
        data: {
          type: UserType.JUDGE,
          judge: {
            create: {},
          },
        },
        select: {
          judge: true,
        },
      });

      await syncJudgePrizes(ctx.prisma, [user.judge!]);
    }),
});
