import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

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
});
