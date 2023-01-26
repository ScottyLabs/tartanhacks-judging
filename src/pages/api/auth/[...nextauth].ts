import NextAuth, { type User, type AuthOptions } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt/types.js";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "../../../env/server.mjs";
import { type HelixUser } from "../../../types/user.js";

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
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

        const authResponse = await fetch(`${env.HELIX_BASE_URL}/auth/login`, {
          method: "POST",
          body: JSON.stringify({
            email: credentials?.username,
            password: credentials?.password,
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!authResponse.ok) {
          return null;
        }

        const helixUser = (await authResponse.json()) as HelixUser | null;
        if (helixUser) {
          const user: User = {
            id: helixUser._id,
            email: helixUser.email,
          };
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
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
