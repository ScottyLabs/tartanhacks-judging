import type { User } from "next-auth";
import { z } from "zod";
import cmp from "../../controllers/cmp";
import { getNext } from "../../controllers/getNext";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

export const judgingRouter = createTRPCRouter({
  // Get the current project to be judged
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx?.session?.user as User;
    const judgeIncludeFields = {
      prizeAssignments: {
        include: {
          leadingProject: {
            include: {
              judgingInstances: true,
            },
          },
          prize: true,
        },
      },
      ignoredProjects: true,
      nextProject: true,
    };

    const judge = await ctx.prisma.judge.findFirst({
      where: { helixId: user.id },
      include: judgeIncludeFields,
    });

    if (judge == null) {
      return null;
    }

    if (judge.nextProject == null) {
      // If current project hasn't been assigned yet
      const project = await getNext(judge, ctx.prisma);
      if (project == null) {
        // No more projects to judge!
        return null;
      }

      // Set the next project
      const updatedJudge = await ctx.prisma.judge.update({
        where: {
          id: judge.id,
        },
        data: {
          nextProjectId: project.id,
        },
        include: judgeIncludeFields,
      });
      return updatedJudge;
    }

    return judge;
  }),

  // Set the next project for this judge
  computeNext: protectedProcedure.mutation(async ({ ctx }) => {
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
        nextProject: {
          include: {
            judgingInstances: true,
          },
        },
      },
    });
    if (!judge) {
      return;
    }

    const prizeAssignments = judge.prizeAssignments ?? [];
    const judgingInstances = judge.nextProject?.judgingInstances ?? [];
    const projectPrizeIds = new Set(
      judgingInstances.map((instance) => instance.prizeId)
    );

    for (const assignment of prizeAssignments) {
      // If no previous project for a prize assignment and
      // current project is entered for this prize,
      // Set this project as the leading project for that prize assignment
      if (
        assignment.leadingProjectId == null &&
        projectPrizeIds.has(assignment.prizeId)
      ) {
        await ctx.prisma.judgePrizeAssignment.update({
          where: {
            id: assignment.id,
          },
          data: {
            leadingProjectId: judge.nextProjectId,
          },
        });
      }
    }

    const project = await getNext(judge, ctx.prisma);
    if (project == null) {
      return;
    }

    await ctx.prisma.judge.update({
      where: {
        id: judge.id,
      },
      data: {
        nextProjectId: project.id,
      },
    });
  }),

  // Perform multiple comparisons at once
  compareMany: protectedProcedure
    .input(
      z.array(
        z.object({
          prizeId: z.string(),
          winnerId: z.string(),
          loserId: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      // Update computation based on current pair-wise comparison
      const user = ctx?.session?.user as User;

      const comparisonInputs = [] as Parameters<typeof cmp>[];
      for (const { prizeId, winnerId, loserId } of input) {
        const judge = await ctx.prisma.judge.findFirst({
          where: { helixId: user.id },
        });
        const prize = await ctx.prisma.prize.findFirst({
          where: { id: prizeId },
        });
        const winner = await ctx.prisma.judgingInstance.findFirst({
          where: { prizeId: prizeId, projectId: winnerId },
        });
        const loser = await ctx.prisma.judgingInstance.findFirst({
          where: { prizeId: prizeId, projectId: loserId },
        });

        if (!(judge && winner && loser && prize)) {
          throw "Invalid judge, winner, loser, or prize ID";
        }

        comparisonInputs.push([winner, loser, prize, judge, ctx.prisma]);
      }

      for (const [winner, loser, prize, judge] of comparisonInputs) {
        await cmp(winner, loser, prize, judge, ctx.prisma);
      }
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
