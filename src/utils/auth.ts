import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface JWTPayload {
  email: string;
  iat: number; // Issued at time
  exp: number; // Expiration time
}
export function generateJWT(
  email: string,
  secret: string
): string {
  const payload: JWTPayload = {
    email,
    iat: Math.floor(Date.now() / 1000), // Get the current time in seconds
    exp: Number.MAX_VALUE,
  };
  return jwt.sign(payload, secret);
}
