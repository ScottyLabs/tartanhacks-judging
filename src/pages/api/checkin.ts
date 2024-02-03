import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../env/server.mjs";
import { prisma } from "../../server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const serviceToken = req.headers.authorization;

    if (serviceToken != env.HELIX_ADMIN_TOKEN) {
      return res.status(403);
    }

    const helixProjectId = req.query.helixProjectId as string;

    await prisma?.project.update({
      where: { helixId: helixProjectId },
      data: {
        isCheckedIn: true,
      },
    });

    res
      .status(200)
      .send(`Project with ID ${helixProjectId} checked in successfully!`);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occured");
  }
}
