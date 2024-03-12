import { z } from "zod";
import { adminMiddleware } from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const adminProcedure = publicProcedure.use(adminMiddleware);

export const settingsRouter = createTRPCRouter({
  /**
   * Get the current event settings
   */
  // TODO make admin only
  getSettings: publicProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma?.settings.findFirst();
    if (settings) {
      return settings;
    }
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Settings not found",
    })
  }),
  putSettings: publicProcedure
    .input(
      z
        .object({
          authMode: z.enum(["LOCAL", "SYNC"]),
          authUrl: z.string(),
          judgingDeadline: z.string().datetime(),
          minVisits: z.number().nonnegative(),
          sigmaInit: z.number().positive(),
          getTeamUrl: z.string(),
          serviceToken: z.string(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma?.settings.updateMany({
        data: input,
      });
    }),
});
