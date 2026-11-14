import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddonManager from "@/components/AddonManager";
export const dynamic="force-dynamic";
export default async function AddonsPage(){await requireAdmin();const addons=await prisma.addon.findMany({orderBy:{namaItem:"asc"}});return <div className="space-y-6"><header><p className="text-sm text-blue-700">MASTER DATA</p><h2 className="mt-1 text-3xl font-bold">Perlengkapan & Kantin</h2><p className="mt-2 text-slate-500">Kelola item, tipe, harga, dan stok.</p></header><AddonManager initial={addons.map(a=>({...a,hargaSatuan:Number(a.hargaSatuan)}))}/></div>}
