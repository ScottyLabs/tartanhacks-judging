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
          authMode: z.enum(["LOCAL", "SYNC"], {
            invalid_type_error: "Invalid auth mode",
          }),
          authUrl: z.string(),
          judgingDeadline: z.string().datetime({
            message: "Invalid deadline",
          }).refine(date => date > new Date().toISOString(), {
            message: "Deadline must be in the future",
          }),
          minVisits: z.number().nonnegative({
            message: "Minimum visits must be a non-negative number",
          }),
          sigmaInit: z.number().positive({
            message: "Initial sigma must be a positive number",
          }),
          getTeamUrl: z.string(),
          serviceToken: z.string(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma?.settings.updateMany({
        data: {
          ...input,
          judgingDeadline: input.judgingDeadline ? new Date(input.judgingDeadline) : undefined,
        },
      });
    }),
});