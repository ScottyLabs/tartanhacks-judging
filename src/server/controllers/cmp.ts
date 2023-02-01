import type {
  Judge,
  JudgingInstance,
  PrismaClient,
  Prize,
} from "@prisma/client";
import * as crowdBT from "../utils/crowd-bt";

export default async function cmp(
  winningInstance: JudgingInstance,
  losingInstance: JudgingInstance,
  prize: Prize,
  judge: Judge,
  prisma: PrismaClient
): Promise<void> {
  try {
    // Save comparisons to ProjectComparisonResult for persistent log
    await prisma.projectComparisonResult.create({
      data: {
        judgeId: judge.id,
        prizeId: prize.id,
        winningProjectId: winningInstance.projectId,
        losingProjectId: losingInstance.projectId,
      },
    });

    // Get new parameters based on this vote
    const [
      updatedAlpha,
      updatedBeta,
      updatedMuWinner,
      updatedSigmaSqWinner,
      updatedMuLoser,
      updatedSigmaSqLoser,
    ] = crowdBT.update(
      judge.alpha,
      judge.beta,
      winningInstance.mu,
      winningInstance.sigma2,
      losingInstance.mu,
      losingInstance.sigma2
    );

    // Update judge parameters - alpha and beta
    await prisma.judge.update({
      where: { id: judge.id },
      data: { alpha: updatedAlpha, beta: updatedBeta },
    });

    // Update winner parameters - mu and sigmaSq
    await prisma.judgingInstance.update({
      where: { id: winningInstance.id },
      data: {
        mu: updatedMuWinner,
        sigma2: updatedSigmaSqWinner,
        timesJudged: winningInstance.timesJudged + 1,
      },
    });

    // Update loser parameters - mu and sigmaSq
    await prisma.judgingInstance.update({
      where: { id: losingInstance.id },
      data: {
        mu: updatedMuLoser,
        sigma2: updatedSigmaSqLoser,
        timesJudged: losingInstance.timesJudged + 1,
      },
    });
  } catch (e) {
    throw e;
  }
}
