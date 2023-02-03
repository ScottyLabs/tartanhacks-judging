import type { User } from "next-auth";
import { z } from "zod";
import cmp from "../../controllers/cmp";
import { getNext } from "../../controllers/getNext";
import {
  compareMany,
  computeNext,
  getCurrent,
} from "../../controllers/judging";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

export const judgingRouter = createTRPCRouter({
  // Get the current project to be judged
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx?.session?.user as User;
    const judge = await getCurrent(ctx.prisma, user.id);

    return judge;
  }),

  // Set the next project for this judge
  computeNext: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx?.session?.user as User;
    await computeNext(ctx.prisma, user.id);
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
      await compareMany(ctx.prisma, user.id, input);
    }),

  // Get the top projects for a specific prize
  getTopProjects: protectedProcedure
    .input(z.object({ prizeId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const defaultPrize = await ctx.prisma.prize.findFirst({
        where: { name: "Scott Krulcik Grand Prize" },
      });

      // Get judging instances with populated projects
      // Winner should have the highest mean score and lowest variance
      const judgments = await ctx.prisma.judgingInstance.findMany({
        where: {
          prizeId: input.prizeId ?? defaultPrize?.id,
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

  skipProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current judge
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

      if (judge == null) {
        return;
      }

      // Mark project as ignored for current judge
      await ctx.prisma.ignoreProjects.upsert({
        where: {
          judgeId_projectId: {
            judgeId: judge.id,
            projectId: input.projectId,
          },
        },
        update: {},
        create: {
          judgeId: judge.id,
          projectId: input.projectId,
        },
      });

      // Get next project
      const project = await getNext(judge, ctx.prisma);

      if (project == null) {
        return;
      }

      // Set project as next project
      await ctx.prisma.judge.update({
        where: {
          id: judge.id,
        },
        data: {
          nextProjectId: project.id,
        },
      });
    }),
});
