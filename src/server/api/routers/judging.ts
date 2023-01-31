import type { User } from "next-auth";
import { z } from "zod";
import cmp from "../../controllers/cmp";
import { getNext } from "../../controllers/getNext";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

export const judgingRouter = createTRPCRouter({
  // Get the next project for the current judge
  getNext: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx?.session?.user as User;
    const judge = await ctx.prisma.judge.findFirst({
      where: { helixId: user.id },
      include: {
        prizeAssignments: {
          include: {
            leadingProject: {
              include: {
                judgingInstances: true,
              },
            },
          },
        },
        ignoredProjects: true,
      },
    });
    if (!judge) {
      return null;
    }

    return await getNext(judge, ctx.prisma);
  }),

  // Perform a comparison between two projects for a specific prize
  compare: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
        winnerId: z.string(),
        loserId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Update computation based on current pair-wise comparison
      const user = ctx?.session?.user as User;

      const judge = await ctx.prisma.judge.findFirst({
        where: { helixId: user.id },
      });
      const prize = await ctx.prisma.prize.findFirst({
        where: { id: input.prizeId },
      });
      const winner = await ctx.prisma.judgingInstance.findFirst({
        where: { prizeId: input.prizeId, projectId: input.winnerId },
      });
      const loser = await ctx.prisma.judgingInstance.findFirst({
        where: { prizeId: input.prizeId, projectId: input.loserId },
      });

      if (!(judge && winner && loser && prize)) {
        throw "Invalid judge, winner, loser, or prize ID";
      }

      await cmp(winner, loser, prize, judge, ctx.prisma);

      return;
    }),

  // Get the top projects for a specific prize
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

  // Get prizes that a judge is judging
  getJudgingPrizes: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx?.session?.user as User;
    const judge = await ctx.prisma.judge.findFirst({
      where: {
        helixId: user.id,
      },
      include: {
        prizeAssignments: {
          include: {
            prize: true,
          },
        },
      },
    });
    const prizes = judge?.prizeAssignments.map(
      (assignment) => assignment.prize
    );

    return prizes;
  }),
});
