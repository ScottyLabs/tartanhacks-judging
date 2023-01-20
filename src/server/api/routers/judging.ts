import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

export const judgingRouter = createTRPCRouter({
  getNext: protectedProcedure.query(({ ctx, input }) => {
    // TODO: Return next project to be assigned
    const user = ctx?.session?.user;

    return;
  }),
  compare: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
        winnerId: z.string(),
        loserId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: Update computation based on current pair-wise comparison
      const user = ctx?.session?.user;
      const prize = await ctx.prisma.prize.findFirst({
        where: { id: input.prizeId },
      });

      return;
    }),
  getTopProjects: protectedProcedure
    .input(z.object({ prizeId: z.string() }))
    .query(({ ctx, input }) => {
      // TODO: return top projects for the specified prize
      const user = ctx?.session?.user;
      return;
    }),
});
