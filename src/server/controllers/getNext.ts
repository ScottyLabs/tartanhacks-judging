import type {
  IgnoreProjects,
  Judge,
  JudgePrizeAssignment,
  JudgingInstance,
  PrismaClient,
  Project,
} from "@prisma/client";
import arrayShuffle from "array-shuffle";
import { argmax, EPSILON, expectedInformationGain } from "../utils/crowd-bt";
import { mapReduce, mapReducePartial } from "../utils/fp";

type JudgeNext = Judge & {
  prizeAssignments: PrizeAssignmentNext[];
  ignoredProjects: IgnoreProjects[];
};
type ProjectNext = Project & {
  judgingInstances: JudgingInstance[];
};
type PrizeAssignmentNext = JudgePrizeAssignment & {
  leadingProject: ProjectNext | null;
};

const MIN_VIEWS = 2;
const TIMEOUT = 10 * 60 * 1000; // in milliseconds

const getPreferredProjects = async (
  judge: JudgeNext,
  prisma: PrismaClient
): Promise<ProjectNext[]> => {
  const ignoredIds = judge.ignoredProjects.map((ip) => ip.projectId);
  const prizeIds = judge.prizeAssignments.map((pa) => pa.prizeId);
  const projects = await prisma.project.findMany({
    where: {
      id: {
        notIn: ignoredIds,
      },
      tableNumber: {
        not: null,
      },
    },
    include: {
      judgingInstances: {
        where: {
          prizeId: {
            in: prizeIds,
          },
        },
      },
    },
  });
  if (projects == null) {
    return [];
  }
  const cutoff = new Date(Date.now() - TIMEOUT);
  const busyJudges = await prisma?.judge.findMany({
    where: {
      updatedAt: {
        gte: cutoff,
      },
    },
  });
  const busyProjects = new Set(busyJudges?.map((bj) => bj.nextProjectId) ?? []);
  const availableProjects = projects.filter(
    (project) => !busyProjects.has(project.id)
  );
  const candidateProjects = availableProjects ? availableProjects : projects;
  const getUnderviewedCount = mapReducePartial(
    (ji: JudgingInstance) => (ji.timesVisited < MIN_VIEWS ? 1 : 0),
    (x, y) => x + y,
    0
  );
  const maxUnderviewedCount = mapReduce(
    (project) => getUnderviewedCount(project.judgingInstances),
    (x, y) => Math.max(x, y),
    0,
    candidateProjects
  );

  return maxUnderviewedCount > 0
    ? candidateProjects.filter(
        (project) =>
          getUnderviewedCount(project.judgingInstances) == maxUnderviewedCount
      )
    : candidateProjects;
};

export const getNext = async (
  judge: JudgeNext,
  prisma: PrismaClient
): Promise<Project | null | undefined> => {
  const preferredProjects = await getPreferredProjects(judge, prisma);
  if (!preferredProjects || preferredProjects?.length == 0) {
    return null;
  }

  const getPrizeLeader = (
    pa: PrizeAssignmentNext
  ): [string | null, JudgingInstance | null] => {
    if (pa.leadingProject != null) {
      const leadingJudgingInstance = pa.leadingProject.judgingInstances.find(
        (ji) => ji.prizeId == pa.prizeId
      );
      return [pa.prizeId, leadingJudgingInstance as JudgingInstance];
    } else {
      return [null, null];
    }
  };
  const prizeBests = new Map(judge.prizeAssignments.map(getPrizeLeader));

  const shuffledProjects = arrayShuffle(preferredProjects);
  if (Math.random() < EPSILON) {
    return shuffledProjects[0];
  } else {
    return argmax(
      (project) =>
        mapReduce(
          (ji) =>
            expectedInformationGain(
              judge.alpha,
              judge.beta,
              (prizeBests.get(ji.prizeId) as JudgingInstance)?.mu ?? 0,
              (prizeBests.get(ji.prizeId) as JudgingInstance)?.sigma2 ?? 0,
              ji.mu,
              ji.sigma2
            ),
          (x, y) => x + y,
          0,
          project.judgingInstances
        ),
      shuffledProjects
    );
  }
};
