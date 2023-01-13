import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";

const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx,
  });
});

export default authMiddleware;
