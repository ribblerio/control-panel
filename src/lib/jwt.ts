import "server-only";

import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Mint a short-lived HS256 JWT that core-module verifies with the shared
 * JWT_SECRET. The proxy route attaches this to upstream requests as a
 * Bearer token. 60s expiry keeps the blast radius tiny.
 */
export async function mintJwt(payload: {
  userId: string;
  email: string;
  role: "admin" | "approver";
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(secret);
}
