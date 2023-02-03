import type { PrismaClient } from "@prisma/client";
import cmp from "./cmp";
import { getNext } from "./getNext";

export interface Comparison {
  prizeId: string;
  winnerId: string;
  loserId: string;
}

/**
 * Get the current project to be judged
 */
export async function getCurrent(prisma: PrismaClient, judgeHelixId: string) {
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

  const judge = await prisma.judge.findFirst({
    where: { helixId: judgeHelixId },
    include: judgeIncludeFields,
  });

  if (judge == null) {
    return null;
  }

  if (judge.nextProjectId == null || judge.nextProject == null) {
    // If current project hasn't been assigned yet
    const project = await getNext(judge, prisma);
    if (project == null) {
      // No more projects to judge!
      return null;
    }

    // Set the next project
    const updatedJudge = await prisma.judge.update({
      where: {
        id: judge.id,
      },
      data: {
        nextProjectId: project.id,
      },
      include: judgeIncludeFields,
    });

    // Add newly assigned project to ignore list
    await prisma.ignoreProjects.upsert({
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
}

/**
 * Compute the next project to be judged
 */
export async function computeNext(prisma: PrismaClient, judgeHelixId: string) {
  const judge = await prisma.judge.findFirst({
    where: { helixId: judgeHelixId },
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
      await prisma.judgePrizeAssignment.update({
        where: {
          id: assignment.id,
        },
        data: {
          leadingProjectId: judge.nextProjectId,
        },
      });
    }
  }

  const project = await getNext(judge, prisma);
  if (project == null) {
    // No more projects to assign
    // Remove next project
    await prisma.judge.update({
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
  await prisma.judge.update({
    where: {
      id: judge.id,
    },
    data: {
      nextProjectId: project.id,
    },
  });

  // Add newly assigned project to ignore list
  await prisma.ignoreProjects.upsert({
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
}

/**
 * Perform multiple comparisons
 */
export async function compareMany(
  prisma: PrismaClient,
  judgeHelixId: string,
  comparisons: Comparison[]
) {
  const judge = await prisma.judge.findFirst({
    where: { helixId: judgeHelixId },
  });

  if (judge == null) {
    return null;
  }

  const comparisonInputs = [] as Parameters<typeof cmp>[];
  for (const { prizeId, winnerId, loserId } of comparisons) {
    const prize = await prisma.prize.findFirst({
      where: { id: prizeId },
    });
    const winner = await prisma.judgingInstance.findFirst({
      where: { prizeId: prizeId, projectId: winnerId },
    });
    const loser = await prisma.judgingInstance.findFirst({
      where: { prizeId: prizeId, projectId: loserId },
    });

    if (!(judge && winner && loser && prize)) {
      throw new Error("Invalid judge, winner, loser, or prize ID");
    }

    comparisonInputs.push([winner, loser, prize, judge, prisma]);
  }

  for (const [winner, loser, prize, judge] of comparisonInputs) {
    await cmp(winner, loser, prize, judge, prisma);
  }
}
