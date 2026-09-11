import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { query } from "./db";

const COOKIE = "fz247_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-secret-change-me");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = String(payload.userId || "");
    if (!userId) return null;
    const result = await query<{id:string; name:string; email:string; role:string}>(
      "select id, name, email, role from users where id=$1 and is_active=true limit 1", [userId]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}
