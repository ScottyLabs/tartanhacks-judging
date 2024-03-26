import { z } from "zod";
import { createTRPCRouter } from "../trpc";

import {
  adminProcedure,
  protectedProcedure,
} from "../middleware/authMiddleware";
import type { User } from "@prisma/client";
import { AuthMode, UserType } from "@prisma/client";

//getProjects - get all projects, admin only
//getUserProject - get a user's project, protected
//saveProject - create a project, and update if it's already created, protected
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
  saveProject: protectedProcedure
    .input(
      z.object({
        teamMembers: z.array(z.string().email()),
        teamName: z.string(),
        name: z.string(),
        description: z.string(),
        githubUrl: z.optional(z.string()),
        otherResources: z.optional(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.prisma.settings.findFirst();
      const isUsingExternalAuth = settings?.authMode == AuthMode.SYNC;
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
      //create User documents for emails that don't exist in the User collection if and only if setting.AuthMode == SYNC. In the local auth case only users in the User collection can be added as team mates, since we assume that the User collection is an accurate whitelist of participants.
      let teamMembers: User[] = [];
      if (isUsingExternalAuth) {
        const teamMembersPromise = input.teamMembers.map(async (email) => {
          const user = await ctx.prisma.user.upsert({
            where: { email },
            update: {},
            create: {
              email,
              type: UserType.PARTICIPANT,
            },
          });

          return user;
        });

        teamMembers = await Promise.all(teamMembersPromise);
      } else {
        const teamMembersPromise = input.teamMembers.map(async (email) => {
          const user = await ctx.prisma.user.findFirst({
            where: { email },
          });

          if (!user) {
            throw new Error(`Team member with email ${email} not found`);
          }

          return user;
        });

        teamMembers = await Promise.all(teamMembersPromise);
      }

      const project = await ctx.prisma.project.upsert({
        where: user.projectId ? { id: user.projectId } : {},
        update: {
          teamName: input.teamName,
          name: input.name,
          description: input.description,
          githubUrl: input.githubUrl,
          otherResources: input.otherResources,
          teamMembers: {
            connect: teamMembers.map((member) => ({ id: member.id })),
          },
        },
        create: {
          teamName: input.teamName,
          name: input.name,
          description: input.description,
          githubUrl: input.githubUrl,
          otherResources: input.otherResources,
          teamMembers: {
            connect: teamMembers.map((member) => ({ id: member.id })),
          },
          location: "", // TODO: add table assignment here
        },
      });

      return project;
    }),
  submitProject: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      if (!project) {
        throw new Error("Project not found");
      }

      const prize = await ctx.prisma.prize.findFirst({
        where: {
          id: input.prizeId,
        },
      });

      if (!prize) {
        throw new Error("Prize not found");
      }

      const updatedProject = await ctx.prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          prizes: {
            connect: {
              id: prize.id,
            },
          },
        },
      });

      return updatedProject;
    }),
  unsubmitProject: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      if (!project) {
        throw new Error("Project not found");
      }

      const prize = await ctx.prisma.prize.findFirst({
        where: {
          id: input.prizeId,
        },
      });

      if (!prize) {
        throw new Error("Prize not found");
      }

      const updatedProject = await ctx.prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          prizes: {
            disconnect: {
              id: prize.id,
            },
          },
        },
      });

      return updatedProject;
    }),
});
