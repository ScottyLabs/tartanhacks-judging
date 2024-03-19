import { z } from "zod";

import { createTRPCRouter } from "../trpc";
import { PrizeCategory } from "@prisma/client";
import { syncJudgePrizes } from "./judgePrizeUtils";
import {
  adminProcedure,
  protectedProcedure,
} from "../middleware/authMiddleware";

export const prizesRouter = createTRPCRouter({
  /**
   * Get all prizes for the event
   */
  getPrizes: protectedProcedure.query(async ({ ctx }) => {
    const prizes = await ctx.prisma.prize.findMany({
      orderBy: [
        {
          providerIconUrl: "asc",
        },
      ],
    });
    return prizes;
  }),

  /**
   * Add new prizes to the event. Descriptions are empty by default.
   */
  putPrizes: adminProcedure
    .input(
      z.object({
        generalPrizes: z.array(z.string()),
        specialPrizes: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { generalPrizes, specialPrizes } = input;
      // insert prizes into the database
      await ctx.prisma.prize.createMany({
        data: [
          ...generalPrizes.map((prize) => ({
            name: prize,
            description: "",
            category: PrizeCategory.GENERAL,
          })),
          ...specialPrizes.map((prize) => ({
            name: prize,
            description: "",
            category: PrizeCategory.SPECIAL,
          })),
        ],
      });
      // assign general prizes to all judges
      await syncJudgePrizes(ctx.prisma);
    }),

  deletePrize: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.prize.delete({
        where: {
          id,
        },
      });
    }),

  updatePrize: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        category: z.nativeEnum(PrizeCategory),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description, category } = input;
      await ctx.prisma.prize.update({
        where: {
          id: input.id,
        },
        data: {
          name,
          description,
          category,
        },
      });
    }),
});
