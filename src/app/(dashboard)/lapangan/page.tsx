import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import CourtManager from "@/components/CourtManager";
export const dynamic="force-dynamic";
export default async function CourtsPage(){await requireAdmin();const courts=await prisma.court.findMany({orderBy:{id:"asc"}});return <div className="space-y-6"><header><p className="text-sm text-blue-700">MASTER DATA</p><h2 className="mt-1 text-3xl font-bold">Data Lapangan</h2><p className="mt-2 text-slate-500">Kelola nama lapangan, jenis olahraga, tarif, dan status aktif.</p></header><CourtManager initial={courts.map(c=>({...c,tarifRegulerPerJam:Number(c.tarifRegulerPerJam),tarifMalamPerJam:Number(c.tarifMalamPerJam)}))}/></div>}
