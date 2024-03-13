import jwt from "jsonwebtoken";

interface JWTPayload {
  email: string;
  iat: number; // Issued at time
}
export function generateMagicLinkToken(email: string, secret: string): string {
  const payload: JWTPayload = {
    email,
    iat: Math.floor(Date.now() / 1000), // Get the current time in seconds
  };
  return jwt.sign(payload, secret, { expiresIn: "3m" }); // Expires in 3 minutes
}

export function decodeJWT(token: string, secret: string): JWTPayload {
  return jwt.verify(token, secret) as JWTPayload;
}
