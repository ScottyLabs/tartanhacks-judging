import { z } from "zod";
import { createTRPCRouter } from "../trpc";

import {
  adminProcedure,
  protectedProcedure,
} from "../middleware/authMiddleware";
import type { User } from "@prisma/client";
import { AuthMode, UserType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

//getProjects - get all projects, admin only
//getUserProject - get a user's project, protected
//saveProject - create a project, and update if it's already created, protected
//submitProject - submit project to a prize, protected
//unsumbitProject - unsubmit project from a prize, protected
export const projectsRouter = createTRPCRouter({
  getProjects: adminProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      include: {
        teamMembers: true,
      },
    });
    return projects.sort((a, b) => a.name.localeCompare(b.name));
  }),
  getUserProject: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx?.session?.user?.email;

    if (!userEmail) {
      throw new TRPCError({ message: "Email not found", code: "UNAUTHORIZED" });
    }

    const user = await ctx.prisma.user.findFirst({
      where: {
        email: userEmail,
      },
      include: {
        project: {
          include: {
            teamMembers: true,
            prizes: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "UNAUTHORIZED" });
    }

    return user.project;
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
        throw new TRPCError({
          message: "Email not found",
          code: "UNAUTHORIZED",
        });
      }

      const user = await ctx.prisma.user.findFirst({
        where: {
          email: userEmail,
        },
      });

      if (!user) {
        throw new TRPCError({
          message: "User not found",
          code: "UNAUTHORIZED",
        });
      }
      //create User documents for emails that don't exist in the User collection if and only if setting.AuthMode == SYNC. In the local auth case only users in the User collection can be added as team mates, since we assume that the User collection is an accurate whitelist of participants.
      let teamMembers: User[] = [];

      if (!(user.email in input.teamMembers)) {
        input.teamMembers.push(user.email);
      }

      if (isUsingExternalAuth) {
        const teamMembersPromise = input.teamMembers.map((email) =>
          ctx.prisma.user.upsert({
            where: { email },
            update: {},
            create: {
              email,
              type: UserType.PARTICIPANT,
            },
          })
        );

        teamMembers = await ctx.prisma.$transaction(teamMembersPromise);
      } else {
        const teamMembersPromise = input.teamMembers.map((email) =>
          ctx.prisma.user.findFirstOrThrow({
            where: { email },
          })
        );
        try {
          teamMembers = await ctx.prisma.$transaction(teamMembersPromise);
        } catch (e) {
          throw new TRPCError({
            message: "One or more team members not found",
            code: "NOT_FOUND",
          });
        }
      }

      // Check that team members aren't already on a different team
      for (const member of teamMembers) {
        if (member.projectId != user.projectId) {
          throw new TRPCError({
            message: `User ${member.email} is on a different team already.`,
            code: "BAD_REQUEST",
          });
        }
      }

      if (user.projectId) {
        const project = await ctx.prisma.project.update({
          where: { id: user.projectId },
          data: {
            teamName: input.teamName,
            name: input.name,
            description: input.description,
            githubUrl: input.githubUrl,
            otherResources: input.otherResources,
            teamMembers: {
              set: teamMembers.map((member) => ({ id: member.id })),
            },
          },
        });
        return project;
      } else {
        const project = await ctx.prisma.project.create({
          data: {
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
      }
    }),
  submitProjectForPrize: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userEmail = ctx?.session?.user?.email;

      if (!userEmail) {
        throw new TRPCError({
          message: "Email not found",
          code: "UNAUTHORIZED",
        });
      }

      const user = await ctx.prisma.user.findFirst({
        where: {
          email: userEmail,
        },
      });

      if (!user) {
        throw new TRPCError({
          message: "User not found",
          code: "UNAUTHORIZED",
        });
      }

      if (!user.projectId) {
        throw new TRPCError({
          message:
            "Project not found. Save your project information before submitting for prizes!",
          code: "NOT_FOUND",
        });
      }

      const judgingInstance = await ctx.prisma.judgingInstance.upsert({
        where: {
          projectId_prizeId: {
            projectId: user.projectId,
            prizeId: input.prizeId,
          },
        },
        update: {},
        create: {
          project: {
            connect: {
              id: user.projectId,
            },
          },
          prize: {
            connect: {
              id: input.prizeId,
            },
          },
        },
      });

      return judgingInstance;
    }),
  unsubmitProjectFromPrize: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userEmail = ctx?.session?.user?.email;

      if (!userEmail) {
        throw new TRPCError({
          message: "Email not found",
          code: "UNAUTHORIZED",
        });
      }

      const user = await ctx.prisma.user.findFirst({
        where: {
          email: userEmail,
        },
      });

      if (!user) {
        throw new TRPCError({
          message: "User not found",
          code: "UNAUTHORIZED",
        });
      }

      if (!user.projectId) {
        throw new TRPCError({
          message:
            "Project not found. Save your project information before submitting for prizes!",
          code: "NOT_FOUND",
        });
      }

      const judgingInstance = await ctx.prisma.judgingInstance.delete({
        where: {
          projectId_prizeId: {
            projectId: user.projectId,
            prizeId: input.prizeId,
          },
        },
      });

      return judgingInstance;
    }),
  getPrizesWithSubmissionStatus: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx?.session?.user?.email;

    if (!userEmail) {
      throw new TRPCError({ message: "Email not found", code: "UNAUTHORIZED" });
    }

    const user = await ctx.prisma.user.findFirst({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      throw new TRPCError({ message: "User not found", code: "UNAUTHORIZED" });
    }

    if (!user.projectId) {
      return null;
    }

    const prizes = await ctx.prisma.prize.findMany({
      include: {
        judgingInstances: {
          where: {
            projectId: user.projectId,
          },
        },
      },
    });

    return prizes;
  }),
});
