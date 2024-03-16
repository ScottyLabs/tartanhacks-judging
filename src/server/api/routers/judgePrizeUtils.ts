import { PrismaClient, PrizeCategory, UserType } from "@prisma/client";

/**
 * Assign all general prizes to all judges
 * @param prisma: prisma instance
 */
export async function syncJudgePrizes(prisma: PrismaClient) {
  const [users, prizes] = await prisma.$transaction([
    prisma.user.findMany({
      where: {
        type: UserType.JUDGE,
      },
      select: {
        judge: true,
      },
    }),
    prisma.prize.findMany({
      where: {
        category: PrizeCategory.GENERAL,
      },
    }),
  ]);

  const judgeIds = users
    .filter((user) => user.judge)
    .map((user) => user.judge!.id);
  const prizeIds = prizes.map((prize) => prize.id);

  const judgePrizes = judgeIds.flatMap((judgeId) =>
    prizeIds.map((prizeId) => ({
      judgeId,
      prizeId,
    }))
  );

  const queries = judgePrizes.map(({judgeId, prizeId}) => {
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
  })

  return await prisma.$transaction(queries);
}