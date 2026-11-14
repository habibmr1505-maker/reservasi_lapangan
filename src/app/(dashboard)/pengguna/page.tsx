import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserManager from "@/components/UserManager";
export const dynamic="force-dynamic";
export default async function UsersPage(){await requireAdmin();const users=await prisma.user.findMany({select:{id:true,username:true,namaLengkap:true,role:true,aktif:true,createdAt:true},orderBy:{id:"asc"}});return <div className="space-y-6"><header><p className="text-sm text-blue-700">ADMINISTRASI</p><h2 className="mt-1 text-3xl font-bold">Pengguna</h2><p className="mt-2 text-slate-500">Buat akun admin/kasir dan kelola status akun.</p></header><UserManager initial={users.map(u=>({...u,createdAt:u.createdAt.toISOString()}))}/></div>}
