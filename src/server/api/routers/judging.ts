import type { User } from "next-auth";
import { z } from "zod";
import cmp from "../../controllers/cmp";
import { getNext } from "../../controllers/getNext";
import authMiddleware, { adminMiddleware } from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const protectedProcedure = publicProcedure.use(authMiddleware);
const adminProcedure = protectedProcedure.use(adminMiddleware);

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
      nextProject: {
        include: {
          judgingInstances: true,
        },
      },
    };

    const judge = await ctx.prisma.judge.findFirst({
      where: { user: {
        email: user.email as string
      } },
      include: judgeIncludeFields,
    });

    if (judge == null) {
      return null;
    }

    if (judge.nextProjectId == null || judge.nextProject == null) {
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

      // Add newly assigned project to ignore list
      await ctx.prisma.ignoreProjects.upsert({
        where: {
          judgeId_projectId: {
            judgeId: updatedJudge.id,
            projectId: project.id,
          },
        },
        update: {},
        create: {
          judgeId: updatedJudge.id,
          projectId: project.id,
        },
      });

      return updatedJudge;
    }

    return judge;
  }),

  // Set the next project for this judge
  computeNext: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx?.session?.user as User;
    const judge = await ctx.prisma.judge.findFirst({
      where: {user: {
        email: user.email as string
      }},
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
      // No more projects to assign
      // Remove next project
      await ctx.prisma.judge.update({
        where: {
          id: judge.id,
        },
        data: {
          nextProjectId: null,
        },
      });
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

    // Add newly assigned project to ignore list
    await ctx.prisma.ignoreProjects.upsert({
      where: {
        judgeId_projectId: {
          judgeId: judge.id,
          projectId: project.id,
        },
      },
      update: {},
      create: {
        judgeId: judge.id,
        projectId: project.id,
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

      const judge = await ctx.prisma.judge.findFirst({
        where: {user: {
          email: user.email as string
        }},
      });

      if (judge == null) {
        return null;
      }

      const comparisonInputs = [] as Parameters<typeof cmp>[];
      for (const { prizeId, winnerId, loserId } of input) {
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
        user: {
          email: user.email as string,
        }
      },
      include: {
        prizeAssignments: {
          include: {
            prize: true,
          },
          orderBy: [
            {
              prize: {
                providerIconUrl: "asc",
              },
            },
            {
              prize: {
                name: "asc",
              },
            },
          ],
        },
      },
    });

    const prizes =
      judge?.prizeAssignments.map((assignment) => assignment.prize) ?? [];

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
        where: {user: {
          email: user.email as string
        }},
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

  assignTables: adminProcedure
    .input(
      z.object({
        numTables: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const projects = (await ctx.prisma.project.findMany()).sort((a, b) =>
        a.id.localeCompare(b.id)
      );
      const numProjects = projects.length;
      const { numTables } = input;
      if (numProjects > numTables) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough tables for all projects",
        });
      }

      const odds = [...Array(Math.ceil(numTables / 2)).keys()].map(
        (i) => i * 2 + 1
      );
      const evens = [...Array(Math.floor(numTables / 2)).keys()].map(
        (i) => (i + 1) * 2
      );
      const tables = [...odds, ...evens].map((i) => `Table ${i}`);

      const tableAssignments = projects.map((project, i) => {
        return {
          projectId: project.id,
          table: tables[i % numTables]!,
        };
      });

      await ctx.prisma.$transaction(
        tableAssignments.map((assignment) => {
          return ctx.prisma.project.update({
            where: {
              id: assignment.projectId,
            },
            data: {
              location: assignment.table,
            },
          });
        })
      );

      return ctx.prisma.project.findMany();
    }),
});
