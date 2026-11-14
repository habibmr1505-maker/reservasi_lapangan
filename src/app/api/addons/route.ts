import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const data = await prisma.addon.findMany({ where: { aktif: true }, orderBy: { namaItem: "asc" } });
  return NextResponse.json(data.map(a => ({ ...a, hargaSatuan: a.hargaSatuan.toString() })));
}
