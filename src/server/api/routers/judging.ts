import { z } from "zod";
import type { HelixUser } from "../../../types/user";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

export const judgingRouter = createTRPCRouter({
  getNext: protectedProcedure.query(async ({ ctx, input }) => {
    // TODO: Return next project to be assigned
    const user = ctx?.session?.user as HelixUser;
    const judge = await prisma?.judge.findFirst({
      where: { helixId: user._id },
    });

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
    .query(async ({ ctx, input }) => {
      // Get judging instances with populated projects
      // Winner should have the highest mean score and lowest variance
      const judgments = await ctx.prisma.judgingInstance.findMany({
        where: {
          prizeId: input.prizeId,
        },
        include: {
          project: true,
        },
        orderBy: [
          {
            mu: "desc",
          },
          {
            sigma2: "asc",
          },
          {
            project: {
              name: "asc",
            },
          },
        ],
      });

      return judgments;
    }),
});
