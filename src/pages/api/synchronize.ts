import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../env/server.mjs";
import { prisma } from "../../server/db";
import type { HelixUser } from "../../types/user.js";

interface HelixPrize {
  _id: string;
  name: string;
  description: string;
  eligibility?: string;
  provider?: {
    name: string;
  };
}

interface HelixTeam {
  _id: string;
  name: string;
}

interface HelixProject {
  _id: string;
  name: string;
  description: string;
  location: string;
  team: HelixTeam;
  prizes: HelixPrize[];
}

/**
 * Pull data from a Helix endpoint
 * @param path Relative path on Helix
 * @param method HTTP method to use
 */
async function fetchData<T>(path: string, method: string): Promise<T> {
  const response = await fetch(`${env.HELIX_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.HELIX_ADMIN_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to pull data from ${path}`);
  }

  const data = (await response.json()) as T;
  return data;
}

/**
 * Synchronize judges with helix
 */
export async function synchronizeJudges() {
  const helixJudges = await fetchData<HelixUser[]>("/judges", "GET");

  const judges = helixJudges.map((judge) => ({
    helixId: judge._id,
    email: judge.email,
    company: judge.company,
  }));

  // Upsert users
  await prisma.$transaction(
    judges.map((judge) =>
      prisma.judge.upsert({
        where: { helixId: judge.helixId },
        update: {},
        create: judge,
      })
    )
  );
}

/**
 * Synchronize prizes with Helix
 */
async function synchronizePrizes() {
  const prizesData = await fetchData<HelixPrize[]>("/prizes", "GET");

  // Find new prizes
  const prizes = prizesData.map(
    ({ name, description, eligibility, provider, _id }) => ({
      helixId: _id,
      name,
      description,
      eligibility: eligibility ?? null,
      provider: provider?.name ?? null,
    })
  );

  // Upsert prizes
  await prisma.$transaction(
    prizes.map((prize) =>
      prisma.prize.upsert({
        where: { helixId: prize.helixId },
        update: {},
        create: prize,
      })
    )
  );
}

/**
 * Synchronize projects with Helix
 */
export async function synchronizeProjects() {
  const helixProjects = await fetchData<HelixProject[]>("/projects", "GET");

  // Remove unnecessary fields
  const minifiedProjects = helixProjects.map(
    ({ name, description, location, team, _id }) => ({
      helixId: _id,
      name,
      description,
      location: location ?? "Missing table",
      team: team?.name ?? "Missing team name",
    })
  );

  // Upsert projects
  await prisma.$transaction(
    minifiedProjects.map((project) =>
      prisma.project.upsert({
        where: { helixId: project.helixId },
        update: {},
        create: project,
      })
    )
  );

  // Prepare helixId to id mapping for projects and prizes
  const projects = await prisma.project.findMany({});
  const prizes = await prisma.prize.findMany({});

  const projectMapping = new Map<string, string>();
  for (const project of projects) {
    projectMapping.set(project.helixId, project.id);
  }

  const prizeMapping = new Map<string, string>();
  for (const prize of prizes) {
    prizeMapping.set(prize.helixId, prize.id);
  }

  let prizeRelations = helixProjects.flatMap(({ _id, prizes: projectPrizes }) =>
    projectPrizes.map((prize) => ({
      prizeId: prizeMapping.get(prize._id) as string,
      projectId: projectMapping.get(_id) as string,
    }))
  );

  // TODO: remove
  // Creates instances where a project might not be submitted for a specific prize
  const projectBlacklist = [
    "cldmaig570008tuis0wq91op3",
    "cldmaig57000atuisfi36krpw",
    "cldmaig57000ctuis34mtv3yo",
  ];
  prizeRelations = prizeRelations.filter(
    (relation) =>
      relation.prizeId != "cldmaifw50006tuis9p0wopl4" ||
      !projectBlacklist.includes(relation.projectId)
  );

  // Upsert judging instances
  await prisma.$transaction(
    prizeRelations.map((relation) =>
      prisma.judgingInstance.upsert({
        where: {
          projectId_prizeId: {
            projectId: relation.projectId,
            prizeId: relation.prizeId,
          },
        },
        update: {},
        create: relation,
      })
    )
  );
}

/**
 * Assign judges to projects
 */
export async function initJudgePrizeAssignments() {
  const judges = await prisma.judge.findMany({});
  const prizes = await prisma.prize.findMany({});

  // Temporarily assign all judges to all prizes
  // TODO: figure out what sponsors are judging their own prizes
  const assignments = [] as { judgeId: string; prizeId: string }[];
  for (const judge of judges) {
    for (const prize of prizes) {
      const assignment = {
        judgeId: judge.id,
        prizeId: prize.id,
      };
      assignments.push(assignment);
    }
  }

  // Upsert judge prize assignments
  await prisma.$transaction(
    assignments.map((assignment) =>
      prisma.judgePrizeAssignment.upsert({
        where: {
          judgeId_prizeId: {
            judgeId: assignment.judgeId,
            prizeId: assignment.prizeId,
          },
        },
        update: {},
        create: assignment,
      })
    )
  );
}

/**
 * Pull prizes and projects from the Helix backend and
 * synchronize with the judging database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await synchronizeJudges();
    await synchronizePrizes();
    await synchronizeProjects();
    await initJudgePrizeAssignments();
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occured");
  }
}
