import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { config } from "../config.js";

export interface TokenPayload {
  sub: string;          // user_id
  tenant_id: string;
  role: "admin" | "member";
  email: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwt.expiresIn)
    .sign(config.jwt.secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, config.jwt.secret);
  return payload as unknown as TokenPayload;
}
