import type {
  IgnoreProjects,
  Judge,
  JudgePrizeAssignment,
  JudgingInstance,
  Project,
} from "@prisma/client";
import arrayShuffle from "array-shuffle";
import { argmax, EPSILON, expected_information_gain } from "../utils/crowd-bt";
import { mapReduce, mapReducePartial } from "../utils/fp";

type JudgeNext = Judge & {
  prizeAssignments: (JudgePrizeAssignment & {
    leadingProject: ProjectNext;
  })[];
  ignoredProjects: IgnoreProjects[];
};
type ProjectNext = Project & {
  judgingInstances: JudgingInstance[];
};

const MIN_VIEWS = 1;
const TIMEOUT = 5 * 60 * 1000; // in milliseconds

const _preferred_projects = async (
  judge: JudgeNext
): Promise<ProjectNext[]> => {
  const ignoredIds = judge.ignoredProjects.map((ip) => ip.projectId);
  const prizeIds = judge.prizeAssignments.map((pa) => pa.prizeId);
  const projects = await prisma?.project.findMany({
    where: {
      id: {
        notIn: ignoredIds,
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
  const busyProjects = busyJudges?.map((bj) => bj.nextProjectId);
  const unbusyProjects = projects.filter((project) =>
    busyProjects?.includes(project.id)
  );
  const candidateProjects = unbusyProjects ? unbusyProjects : projects;
  const getUnderviewedCount = mapReducePartial(
    (ji: JudgingInstance) => (ji.timesJudged < MIN_VIEWS ? 1 : 0),
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
  judge: JudgeNext
): Promise<Project | null | undefined> => {
  const preferred_projects = await _preferred_projects(judge);
  if (!preferred_projects) {
    return null;
  }

  const getPrizeLeader = async (
    pa: JudgePrizeAssignment
  ): Promise<[string, JudgingInstance]> => {
    const leadingProject = (await prisma?.project.findUnique({
      where: { id: pa.leadingProjectId },
      include: {
        judgingInstances: {
          where: {
            prizeId: pa.prizeId,
          },
        },
      },
    })) as ProjectNext;
    return [pa.prizeId, leadingProject.judgingInstances[0] as JudgingInstance];
  };
  const prizeBests = new Map(
    await Promise.all(judge.prizeAssignments.map(getPrizeLeader))
  );

  const shuffled_projects = arrayShuffle(preferred_projects);
  if (Math.random() < EPSILON) {
    return shuffled_projects[0];
  } else {
    return argmax(
      (project) =>
        mapReduce(
          (ji) =>
            expected_information_gain(
              judge.alpha,
              judge.beta,
              (prizeBests.get(ji.prizeId) as JudgingInstance).mu,
              (prizeBests.get(ji.prizeId) as JudgingInstance).sigma2,
              ji.mu,
              ji.sigma2
            ),
          (x, y) => x + y,
          0,
          project.judgingInstances
        ),
      shuffled_projects
    );
  }
};
