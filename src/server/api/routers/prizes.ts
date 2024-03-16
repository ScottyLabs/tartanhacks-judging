import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { PrizeCategory } from "@prisma/client";
import { syncJudgePrizes } from "./judgePrizeUtils";

export const prizesRouter = createTRPCRouter({
  /**
   * Get all prizes for the event
   */
  getPrizes: publicProcedure.query(async ({ ctx }) => {
    const prizes = await ctx.prisma.prize.findMany({
      orderBy: [
        {
          providerIconUrl: "asc",
        },
      ],
    });
    return prizes;
  }),

  //TODO make admin only
  putPrizes: publicProcedure.input(
    z.object({
      generalPrizes: z.array(z.object({
        name: z.string(),
        description: z.string(),
      })),
      specialPrizes: z.array(z.object({
        name: z.string(),
        description: z.string(),
      })),
    }),
  ).mutation(async ({ ctx, input }) => {
    const { generalPrizes, specialPrizes } = input;
    // insert prizes into the database
    await ctx.prisma.prize.createMany({
      data: [
      ...generalPrizes.map((prize) => ({
        name: prize.name,
        description: prize.description,
        category: PrizeCategory.GENERAL,
      })),
      ...specialPrizes.map((prize) => ({
        name: prize.name,
        description: prize.description,
        category: PrizeCategory.SPECIAL,
      })),
      ],
    });
    // assign general prizes to all judges
    await syncJudgePrizes(ctx.prisma);
  }),

  deletePrize: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.prize.delete({
        where: {
          id,
        },
      });
    }),
});
