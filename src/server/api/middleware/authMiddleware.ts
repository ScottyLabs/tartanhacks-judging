import { TRPCError } from "@trpc/server";
import { middleware, publicProcedure } from "../trpc";
import { UserType } from "@prisma/client";

const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx,
  });
});

const adminMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user?.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const user = await ctx.prisma.user.findFirst({
    where: {
      email: ctx.session.user.email,
    },
  });
  if (!user?.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx,
  });
});

const judgeMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user?.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const user = await ctx.prisma.user.findFirst({
    where: {
      email: ctx.session.user.email,
    },
  });
  if (user?.type != UserType.JUDGE) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx,
  });
});

const protectedProcedure = publicProcedure.use(authMiddleware);
const adminProcedure = publicProcedure.use(adminMiddleware);
const judgeProcedure = publicProcedure.use(judgeMiddleware);

export default authMiddleware;
export {
  adminMiddleware,
  judgeMiddleware,
  protectedProcedure,
  adminProcedure,
  judgeProcedure,
};
