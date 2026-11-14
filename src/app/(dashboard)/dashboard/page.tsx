import Link from "next/link";
import { CalendarCheck, Clock3, Wallet, ReceiptText, Plus, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { rupiah, dateID } from "@/lib/format";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [todayBookings, recent, courts, occupied, payments, unpaid, allSlots] = await Promise.all([
    prisma.booking.count({ where: { tanggalMain: { gte: start, lt: end }, statusBooking: { not: "DIBATALKAN" } } }),
    prisma.booking.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { court: true } }),
    prisma.court.count({ where: { statusAktif: true } }),
    prisma.booking.findMany({ where: { tanggalMain: { gte: start, lt: end }, statusBooking: { not: "DIBATALKAN" } }, select: { jamMulai: true, jamSelesai: true } }),
    prisma.payment.aggregate({ where: { createdAt: { gte: monthStart }, booking: { statusBooking: { not: "DIBATALKAN" } } }, _sum: { jumlah: true } }),
    prisma.booking.aggregate({ where: { statusBooking: { not: "DIBATALKAN" }, sisaBayar: { gt: 0 } }, _sum: { sisaBayar: true } }),
    prisma.court.findMany({ where: { statusAktif: true } })
  ]);
  const occupiedMinutes = occupied.reduce((sum, b) => sum + Math.max(0, Number(b.jamSelesai.split(":")[0])*60+Number(b.jamSelesai.split(":")[1]) - Number(b.jamMulai.split(":")[0])*60-Number(b.jamMulai.split(":")[1])), 0);
  const operationalMinutes = courts * 14 * 60;
  const occupancy = operationalMinutes ? Math.min(100, Math.round(occupiedMinutes / operationalMinutes * 100)) : 0;
  const cards = [
    { title: "Booking Hari Ini", value: String(todayBookings), note: "Reservasi tidak dibatalkan", icon: CalendarCheck, color: "bg-blue-50 text-blue-700" },
    { title: "Okupansi Hari Ini", value: `${occupancy}%`, note: "Asumsi operasional 06.00–20.00", icon: Clock3, color: "bg-violet-50 text-violet-700" },
    { title: "Pembayaran Bulan Ini", value: rupiah(payments._sum.jumlah ?? 0), note: "Pembayaran tercatat", icon: Wallet, color: "bg-emerald-50 text-emerald-700" },
    { title: "Sisa Tagihan", value: rupiah(unpaid._sum.sisaBayar ?? 0), note: "Semua booking aktif", icon: ReceiptText, color: "bg-amber-50 text-amber-700" }
  ];
  return <div className="space-y-7">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-slate-500">{dateID(now)}</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h2><p className="mt-2 text-slate-500">Ringkasan operasional Champions Sports Arena.</p></div><Link href="/transaksi/baru" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"><Plus size={18}/> Buat Booking</Link></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => { const Icon=card.icon; return <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{card.title}</span><span className={`rounded-xl p-2 ${card.color}`}><Icon size={20}/></span></div><p className="mt-5 break-words text-2xl font-bold">{card.value}</p><p className="mt-2 text-xs text-slate-400">{card.note}</p></div>; })}</section>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h3 className="font-bold">Transaksi Terbaru</h3><p className="mt-1 text-sm text-slate-500">Booking terakhir yang dibuat.</p></div><Link href="/transaksi" className="flex items-center gap-1 text-sm font-semibold text-blue-700">Semua <ArrowUpRight size={16}/></Link></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr>{["No. Booking","Pemesan","Lapangan","Tanggal","Total","Status"].map(x=><th key={x} className="px-5 py-3 font-medium">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{recent.map(b=><tr key={b.id}><td className="px-5 py-4 font-semibold text-blue-700">{b.noBooking}</td><td className="px-5 py-4">{b.namaPemesan}</td><td className="px-5 py-4">{b.court.namaLapangan}</td><td className="px-5 py-4">{dateID(b.tanggalMain)}</td><td className="px-5 py-4">{rupiah(b.grandTotal.toString())}</td><td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{b.statusBooking.replaceAll("_"," ")}</span></td></tr>)}</tbody></table>{recent.length===0 && <p className="p-8 text-center text-slate-500">Belum ada transaksi. Buat booking pertama untuk memulai.</p>}</div></section>
    <p className="text-xs leading-5 text-slate-400">Catatan: KPI okupansi memakai asumsi jam operasional 06.00–20.00 dan menghitung jumlah jam booking yang terdaftar. Sesuaikan dengan jam operasional sebenarnya sebelum digunakan untuk laporan resmi.</p>
  </div>;
}
