import { z } from "zod";
import { adminProcedure } from "../middleware/authMiddleware";

import { createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";
import { AuthMode } from "@prisma/client";

export const settingsRouter = createTRPCRouter({
  /**
   * Get the current event settings
   */
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma?.settings.findFirst();
    if (settings) {
      return settings;
    }
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Settings not found",
    });
  }),
  putSettings: adminProcedure
    .input(
      z
        .object({
          authMode: z.nativeEnum(AuthMode, {
            invalid_type_error: "Invalid auth mode",
          }),
          authUrl: z.string(),
          judgingDeadline: z
            .string()
            .datetime({
              message: "Invalid deadline",
            })
            .refine((date) => date > new Date().toISOString(), {
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
          judgingDeadline: input.judgingDeadline
            ? new Date(input.judgingDeadline)
            : undefined,
        },
      });
    }),
});
