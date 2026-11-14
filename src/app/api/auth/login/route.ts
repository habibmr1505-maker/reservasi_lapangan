import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ username: z.string().min(1).max(60), password: z.string().min(1).max(200) });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
    if (!user || !user.aktif || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
    }
    await createSession({ id: user.id, username: user.username, namaLengkap: user.namaLengkap, role: user.role });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server belum siap. Pastikan database dan konfigurasi sudah benar." }, { status: 500 });
  }
}
