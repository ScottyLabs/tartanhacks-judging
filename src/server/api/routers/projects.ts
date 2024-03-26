import { createTRPCRouter } from "../trpc";

import {
  adminProcedure,
  protectedProcedure,
} from "../middleware/authMiddleware";

//getProjects - get all projects, admin only
//getUserProject - get a user's project, protected
//createProject - create a project, protected
//updateProject - update a project, protected
//submitProject - submit project to a prize, protected
//unsumbitProject - unsubmit project from a prize, protected
export const projectsRouter = createTRPCRouter({
  getProjects: adminProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany();
    return projects.sort((a, b) => a.name.localeCompare(b.name));
  }),
  getUserProject: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx?.session?.user?.email;

    if (!userEmail) {
      throw new Error("Email not found");
    }

    const user = await ctx.prisma.user.findFirst({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const project = await ctx.prisma.project.findFirst({
      where: {
        teamMembers: {
          some: user,
        },
      },
    });

    return project;
  }),
});
