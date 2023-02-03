import type { Judge, PrismaClient, Prize, Project } from "@prisma/client";
import { flipCoin } from "../utils/probability";
import {
  compareMany,
  type Comparison,
  computeNext,
  getCurrent,
} from "./judging";

const JUDGE_COUNT = 10;
const PRIZE_COUNT = 10;
const PROJECT_COUNT = 10;
const NUM_ROUNDS = 1;

/**
 * Clear the database
 */
async function clearEntities(prisma: PrismaClient) {
  await prisma.ignoreProjects.deleteMany();
  await prisma.projectComparisonResult.deleteMany();

  await prisma.judgingInstance.deleteMany();
  await prisma.judgePrizeAssignment.deleteMany();

  await prisma.judge.deleteMany();
  await prisma.project.deleteMany();
  await prisma.prize.deleteMany();
}

/**
 * Populate database with simulation entities
 */
async function populateEntities(prisma: PrismaClient) {
  for (let i = 1; i <= PRIZE_COUNT; i++) {
    const prizeName = `Prize ${i}`;
    await prisma.prize.create({
      data: {
        helixId: prizeName,
        name: prizeName,
        description: prizeName,
      },
    });
  }

  for (let i = 1; i <= JUDGE_COUNT; i++) {
    const judgeName = `Judge ${i}`;
    await prisma.judge.create({
      data: {
        helixId: judgeName,
        email: judgeName,
      },
    });
  }

  for (let i = 1; i <= PROJECT_COUNT; i++) {
    const projectName = `Project ${i}`;
    const teamName = `Team ${i}`;
    const location = `Table ${i}`;

    await prisma.project.create({
      data: {
        helixId: projectName,
        name: projectName,
        description: teamName,
        location,
        team: teamName,
      },
    });
  }
}

/**
 * Assigns projects to prizes
 */
async function createJudgingInstances(
  prisma: PrismaClient,
  projects: Project[],
  prizes: Prize[]
) {
  // Create judging instances
  for (const project of projects) {
    const projectPrizes = [];
    for (const prize of prizes) {
      if (flipCoin()) {
        projectPrizes.push(prize.id);
      }
    }

    const judgingInstances = projectPrizes.map((prizeId) => ({
      prizeId: prizeId,
      projectId: project.id,
    }));
    await prisma.judgingInstance.createMany({
      data: judgingInstances,
    });
  }
}

/**
 * Assigns judges to prizes
 */
async function createJudgePrizeAssignments(
  prisma: PrismaClient,
  judges: Judge[],
  prizes: Prize[]
) {
  // Assign judges to judge all prizes
  for (const judge of judges) {
    const judgePrizes = [];
    for (const prize of prizes) {
      judgePrizes.push(prize.id);
    }

    const assignments = judgePrizes.map((prizeId) => ({
      prizeId: prizeId,
      judgeId: judge.id,
    }));
    await prisma.judgePrizeAssignment.createMany({
      data: assignments,
    });
  }
}

/**
 * Prepare relationships between simulation entities
 */
async function prepareRelations(prisma: PrismaClient) {
  const projects = await prisma.project.findMany();
  const prizes = await prisma.prize.findMany();
  const judges = await prisma.judge.findMany();

  await createJudgingInstances(prisma, projects, prizes);
  await createJudgePrizeAssignments(prisma, judges, prizes);
}

/**
 * Clear and populate the database with the necessary entities for the simulation
 */
export async function prepareSimulation(prisma: PrismaClient) {
  await clearEntities(prisma);
  await populateEntities(prisma);
  await prepareRelations(prisma);
}

/**
 * Return the index associated with a project
 */
function getProjectNumber(project: Project): number {
  return parseInt(project.name.slice("Project ".length));
}

/**
 * Start the simulation
 */
export async function startSimulation(prisma: PrismaClient) {
  const judges = await prisma.judge.findMany();

  // Compute next for each judge
  for (const judge of judges) {
    await getCurrent(prisma, judge.helixId);
    await computeNext(prisma, judge.helixId);
  }

  let judgments = 0;

  for (let round = 0; round < NUM_ROUNDS; round++) {
    for (const judge of judges) {
      const current = await getCurrent(prisma, judge.helixId);

      if (current == null || current.nextProject == null) {
        // No next project
        console.log("No next project");
        break;
      }

      const project = current.nextProject;
      const projectPrizeIds = new Set(
        project.judgingInstances.map((instance) => instance.prizeId)
      );
      const relevantPrizes = current.prizeAssignments.filter((assignment) =>
        projectPrizeIds.has(assignment.prizeId)
      );

      const comparisons = [] as Comparison[];
      for (const assignment of relevantPrizes) {
        if (
          assignment.leadingProject == null ||
          assignment.leadingProjectId == null
        ) {
          // No leading project
          break;
        }
        const prevIndex = getProjectNumber(assignment.leadingProject);
        const currIndex = getProjectNumber(project);

        const p = prevIndex / (prevIndex + currIndex);
        const win = flipCoin(p);
        comparisons.push({
          prizeId: assignment.prizeId,
          winnerId: win ? project.id : assignment.leadingProjectId,
          loserId: win ? assignment.leadingProjectId : project.id,
        });
        judgments++;
      }

      await compareMany(prisma, judge.helixId, comparisons);
      await computeNext(prisma, judge.helixId);
    }
  }

  console.log("Judgments made:", judgments);
}

/**
 * P(i vs j) = i / i + j
 */
