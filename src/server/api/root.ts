import { createTRPCRouter } from "./trpc";
import { judgingRouter } from "./routers/judging";
import { prizesRouter } from "./routers/prizes";
import { settingsRouter } from "./routers/settings";
import { usersRouter } from "./routers/users";
import { authRouter } from "./routers/auth";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  judging: judgingRouter,
  prizes: prizesRouter,
  settings: settingsRouter,
  users: usersRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
