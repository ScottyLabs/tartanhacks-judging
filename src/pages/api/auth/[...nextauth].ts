import NextAuth, { type User, type AuthOptions } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt/types.js";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "../../../env/server.mjs";
import { type HelixUser } from "../../../types/user.js";

import { prisma } from "../../../server/db.js";
import { AuthMode, UserType } from "@prisma/client";

export interface JudgingUser extends User {
  userType: UserType;
  isAdmin: boolean;
}

const settings = await prisma.settings.findFirst();
const isExternalAuthEnabled = settings?.authMode == AuthMode.SYNC;

const credentialsProvider = isExternalAuthEnabled
  ? CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        username: {
          label: "Email",
          type: "text",
          placeholder: "acarnegie@andrew.cmu.edu",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)

        const authURL = settings?.authUrl;

        if (!authURL) {
          throw new Error("Auth URL not set");
        }

        const email = credentials?.username;

        if (!email) {
          return null;
        }

        const authResponse = await fetch(authURL, {
          method: "POST",
          body: JSON.stringify({
            email: email,
            password: credentials?.password,
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!authResponse.ok) {
          return null;
        }

        const helixUser = (await authResponse.json()) as HelixUser | null;
        if (helixUser) {
          const prismaUser = await prisma.user.upsert({
            where: { email: email },
            create: {
              email: email,
              type: helixUser.userType,
              isAdmin: helixUser.isAdmin,
            },
            update: {
              type: helixUser.userType,
              isAdmin: helixUser.isAdmin,
            },
          });
          const user: JudgingUser = {
            id: prismaUser.id,
            email: email,
            userType: helixUser.userType,
            isAdmin: helixUser.isAdmin,
          };
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    })
  : CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        magicLinkToken: {
          label: "Magic Link Token",
          type: "text",
        },
      },
      authorize(credentials) {
        console.log(credentials?.magicLinkToken);
        return null;
      },
    });

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [credentialsProvider],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: ({ session, token }: { session: Session; token: JWT }) => {
      if (token) {
        session.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
};

export default NextAuth(authOptions);
