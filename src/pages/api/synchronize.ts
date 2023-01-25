import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../env/server.mjs";
import { prisma } from "../../server/db";

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
 * Synchronize prizes with Helix
 */
async function synchronizePrizes() {
  // Pull prizes from Helix
  const prizesResponse = await fetch(`${env.HELIX_BASE_URL}/prizes`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!prizesResponse.ok) {
    throw new Error("Failed to pull prize data");
  }

  const prizesData = (await prizesResponse.json()) as HelixPrize[];

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
async function synchronizeProjects() {
  const projectsResponse = await fetch(`${env.HELIX_BASE_URL}/projects`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.HELIX_ADMIN_TOKEN,
    },
  });

  if (!projectsResponse.ok) {
    throw new Error("Failed to pull projects");
  }

  // Remove unnecessary fields
  const helixProjects = (await projectsResponse.json()) as HelixProject[];
  const minifiedProjects = helixProjects.map(
    ({ name, description, location, team, _id }) => ({
      helixId: _id,
      name,
      description,
      location,
      team: team?.name,
    })
  );

  // Extract prize relations
  const prizeRelations = helixProjects.flatMap(({ _id, prizes }) =>
    prizes.map((prize) => ({ prizeId: prize._id, projectId: _id }))
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

  // Upsert project-prize relations
  await prisma.$transaction(
    prizeRelations.map((relation) =>
      prisma.projectPrizeRelation.upsert({
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
 * Pull prizes and projects from the Helix backend and
 * synchronize with the judging database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await synchronizePrizes();
    await synchronizeProjects();
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occured");
  }
}
