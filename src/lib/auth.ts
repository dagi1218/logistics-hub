// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-super-secret-key-change-this-in-prod"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: "DISPATCHER" | "DRIVER" | "ADMIN";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Session lasts 24 hours
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}


export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");
    const email = headerList.get("x-user-email");
    const role = headerList.get("x-user-role") as JWTPayload["role"] | null;

    if (userId && email && role) {
      return { userId, email, role };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    return await verifyToken(token);
  } catch {
    return null;
  }
}