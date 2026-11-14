import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";

const COOKIE_NAME = "reservasi_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "development-secret-change-this-32chars"
);

export type SessionUser = { id: number; username: string; namaLengkap: string; role: "ADMIN" | "KASIR" };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 8
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.id !== "number" || (payload.role !== "ADMIN" && payload.role !== "KASIR")) return null;
    return {
      id: payload.id,
      username: String(payload.username ?? ""),
      namaLengkap: String(payload.namaLengkap ?? ""),
      role: payload.role
    };
  } catch { return null; }
}

export async function requireUser() {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
