"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChartNoAxesCombined, ClipboardList, LayoutDashboard, LogOut, Package, Settings, Users, Building2 } from "lucide-react";

type Props = { user: { namaLengkap: string; username: string; role: "ADMIN" | "KASIR" } };
const base = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi Booking", icon: CalendarDays },
  { href: "/lapangan", label: "Data Lapangan", icon: Building2 },
  { href: "/perlengkapan", label: "Perlengkapan", icon: Package },
  { href: "/laporan", label: "Laporan", icon: ChartNoAxesCombined }
];
export default function Sidebar({ user }: Props) {
  const path = usePathname(); const router = useRouter();
  const links = user.role === "ADMIN" ? [...base, { href: "/pengguna", label: "Pengguna", icon: Users }] : base;
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  return <aside className="flex w-full flex-col bg-slate-950 text-white md:min-h-screen md:w-64 md:shrink-0">
    <div className="border-b border-white/10 p-5"><p className="text-xs font-bold tracking-[.2em] text-cyan-300">CHAMPIONS</p><h1 className="mt-1 text-lg font-bold">Sports Arena</h1><p className="mt-1 text-xs text-slate-400">Sistem reservasi lapangan</p></div>
    <div className="flex items-center gap-3 border-b border-white/10 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 font-bold">{user.namaLengkap.slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.namaLengkap}</p><p className="text-xs text-slate-400">{user.role}</p></div></div>
    <nav className="grid grid-cols-2 gap-1 p-3 sm:grid-cols-3 md:flex md:flex-1 md:flex-col">{links.map(item => { const Icon = item.icon; const active = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href)); return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? "bg-blue-700 text-white" : "text-slate-300 hover:bg-white/10"}`}><Icon size={18}/>{item.label}</Link>; })}</nav>
    <div className="p-3"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-red-500/20 hover:text-white"><LogOut size={18}/> Keluar</button></div>
  </aside>;
}
