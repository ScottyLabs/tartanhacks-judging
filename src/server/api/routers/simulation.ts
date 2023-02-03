import { prepareSimulation, startSimulation } from "../../controllers/simulate";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

export const simulationRouter = createTRPCRouter({
  prepareSimulation: protectedProcedure.mutation(async ({ ctx }) => {
    await prepareSimulation(ctx.prisma);
  }),
  startSimulation: protectedProcedure.mutation(async ({ ctx }) => {
    await startSimulation(ctx.prisma);
  }),
});
