import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const data = await prisma.court.findMany({ where: { statusAktif: true }, orderBy: { namaLapangan: "asc" } });
  return NextResponse.json(data.map(c => ({ ...c, tarifRegulerPerJam: c.tarifRegulerPerJam.toString(), tarifMalamPerJam: c.tarifMalamPerJam.toString() })));
}
