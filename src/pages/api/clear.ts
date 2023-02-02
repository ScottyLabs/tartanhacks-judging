import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db";
import {
  initJudgePrizeAssignments,
  synchronizeJudges,
  synchronizeProjects,
} from "./synchronize";

/**
 * TODO: remove
 * Debug endpoint for clearing the database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await prisma.judge.deleteMany();
    await synchronizeJudges();

    await prisma.judgePrizeAssignment.deleteMany({});
    await initJudgePrizeAssignments();

    await prisma.judgingInstance.deleteMany({});
    await synchronizeProjects();

    await prisma.projectComparisonResult.deleteMany({});
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occured");
  }
}
