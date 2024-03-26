import { UserType, type Judge, type PrismaClient, PrizeCategory } from "@prisma/client";

/**
 * Assign all general prizes to all judges
 * @param prisma: prisma instance
 * @param judges: list of judges to assign prizes to (optional)
 */
export async function syncJudgePrizes(prisma: PrismaClient, judges?: Judge[]) {
  let judgeIds: string[] = [];
  if (judges) {
    judgeIds = judges.map((judge) => judge.id);
  } else {
    // apply to all judges
    const users = await prisma.user.findMany({
      where: {
        type: UserType.JUDGE,
      },
      select: {
        judge: true,
      },
    });
    judgeIds = users.filter((user) => user.judge).map((user) => user.judge!.id);
  }

  const prizes = await prisma.prize.findMany({
    where: {
      category: PrizeCategory.GENERAL,
    },
  });
  const prizeIds = prizes.map((prize) => prize.id);

  const judgePrizes = judgeIds.flatMap((judgeId) =>
    prizeIds.map((prizeId) => ({
      judgeId,
      prizeId,
    }))
  );

  const queries = judgePrizes.map(({ judgeId, prizeId }) => {
    return prisma.judgePrizeAssignment.upsert({
      where: {
        judgeId_prizeId: {
          judgeId: judgeId,
          prizeId: prizeId,
        },
      },
      update: {},
      create: {
        judgeId,
        prizeId,
      },
    });
  });

  return await prisma.$transaction(queries);
}
