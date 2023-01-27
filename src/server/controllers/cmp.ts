import { Judge, JudgingInstance, PrismaClient } from "@prisma/client";

export default async function cmp(
  winningInstance: JudgingInstance,
  losingInstance: JudgingInstance,
  judge: Judge,
  prisma: PrismaClient
): Promise<void> {
  // get Judge, winningInstance, losingInstance
  // Save comparisons to ProjectComparisonResult
  // use perform_vote logic to update:
  //   - mu and sigma2 of winner and loser on judging instances
  //   - alpha and beta of judge
}
