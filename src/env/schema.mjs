// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  HELIX_BASE_URL: z.string().url(),
  HELIX_ADMIN_TOKEN: z.string(),
  ADMIN_EMAIL: z.string().email(),
  JWT_SECRET: z.string(),
  EMAIL_CONTACT: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string(),
  EMAIL_TLS: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  VERCEL_URL: z.string(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
});
