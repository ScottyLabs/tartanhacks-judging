import type {Prize} from "@prisma/client";
import type {NextApiRequest, NextApiResponse} from "next";
import {env} from "../../env/server.mjs";
import {prisma} from "../../server/db";
import type {HelixUser} from "../../types/user.js";

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
  tableNumber: null | string;
}

const GRAND_PRIZE_NAME = "Scott Krulcik Grand Prize";

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

  return (await response.json()) as T;
}

/**
 * Synchronize judges with helix
 */
export async function synchronizeJudges() {
  const helixJudges = await fetchData<HelixUser[]>("/judges", "GET");

  const judges = helixJudges.map((judge) => ({
    helixId: judge._id,
    email: judge.email,
    company: judge.company?.name,
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
    ({ name, description, location, team, _id, tableNumber }) => ({
      helixId: _id,
      name,
      description,
      location: location ?? "Missing table",
      team: team?.name ?? "Missing team name",
      tableNumber: tableNumber,
    })
  );

  // Upsert projects
  await prisma.$transaction(
    minifiedProjects.map((project) =>
      prisma.project.upsert({
        where: { helixId: project.helixId },
        update: { tableNumber: project.tableNumber },
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

  const prizeRelations = helixProjects.flatMap(
    ({ _id, prizes: projectPrizes }) =>
      projectPrizes.map((prize) => ({
        prizeId: prizeMapping.get(prize._id) as string,
        projectId: projectMapping.get(_id) as string,
      }))
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

// TODO: These prizes are only judges by
const exclusivePrizes = [
  "Best Content Creation Hack",
  "Story Prize",
  "XRP Ledger Challenge",
  "Best Use of Computer Vision",
  "Quantum Track"
];

const partialPrizes = {
  "GSA Campus Experience Prize": ["cls6iu27j001ql608hqhsy3qk"],
  "Project Olympus Spark Grant": [
    "cls6iu27j001sl608valjzecb", // Matthew Katsaros
    "cls6iu27j001ul608l2nwl2ia", // Kit Needham
  ],
};

const ignorePrizes = [
  "Best Use of AI by powered Reach Capital",
  "Best Use of Gen AI",
  "Best Domain Name from GoDaddy Registry",
  "Best AI Application Built with Cloudflare",
];

/**
 * Get the mapping of partial judge ids to their prizes
 */
function getPartialPrizeJudgeMap() {
  // Set prizes for each partial judge
  const partialJudgeIds = new Set(Object.values(partialPrizes).flat());
  const partialJudgeMap = new Map<string, string[]>();
  const partialPrizeNames = Object.keys(
    partialPrizes
  ) as (keyof typeof partialPrizes)[];
  for (const id of partialJudgeIds) {
    const prizes = partialPrizeNames.filter((prizeName) =>
      partialPrizes[prizeName].includes(id)
    );
    partialJudgeMap.set(id, prizes);
  }

  return partialJudgeMap;
}

/**
 * Assign judges to projects
 */
export async function initJudgePrizeAssignments() {
  const judges = await prisma.judge.findMany({});
  const allPrizes = await prisma.prize.findMany({});
  const grandPrize = await prisma.prize.findFirst({
    where: { name: GRAND_PRIZE_NAME },
  });

  if (grandPrize == null) {
    throw new Error("Could not find Grand Prize!");
  }

  // Mapping of partial judges to their prizes
  const partialJudgeMap = getPartialPrizeJudgeMap();

  const assignments = [] as { judgeId: string; prizeId: string }[];
  for (const judge of judges) {
    let prizes = [] as Prize[];
    if (judge.company != null) {
      // Assign judges to their prizes
      prizes = await prisma.prize.findMany({
        where: {
          provider: judge.company,
        },
      });
      prizes.push(grandPrize);
    } else if (partialJudgeMap.has(judge.id)) {
      // Assign partial judges
      const prizeNames = partialJudgeMap.get(judge.id) ?? [];
      prizes = await prisma.prize.findMany({
        where: {
          name: {
            in: prizeNames,
          },
        },
      });
      prizes.push(grandPrize);
    } else {
      // Assign general judges to all prizes except to exclusive
      prizes = allPrizes.filter(
        (prize) => !exclusivePrizes.includes(prize.name)
      );
    }

    // Create assignments for each judge
    for (const prize of prizes) {
      // We're not judging prizes in ignorePrizes
      if (ignorePrizes.includes(prize.name)) {
        continue;
      }

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
