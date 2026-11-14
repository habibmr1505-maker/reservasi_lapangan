import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bookingSchema } from "@/lib/validation";
import { calculateCourtCost, isOverlapping, makeBookingNumber, timeToMinutes } from "@/lib/booking";

export async function GET(request: Request) {
  if (!await getSession()) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const bookings = await prisma.booking.findMany({
    where: {
      ...(q ? { OR: [{ noBooking: { contains: q } }, { namaPemesan: { contains: q } }, { namaTim: { contains: q } }] } : {}),
      ...(status && ["MENUNGGU_DP","TERKONFIRMASI","SEDANG_BERMAIN","SELESAI","DIBATALKAN"].includes(status) ? { statusBooking: status as never } : {})
    },
    include: { court: true, items: { include: { addon: true } }, payments: true },
    orderBy: { createdAt: "desc" }, take: 200
  });
  return NextResponse.json(bookings.map(b => ({
    ...b, tanggalMain: b.tanggalMain.toISOString().slice(0,10),
    durasiJam: b.durasiJam.toString(), totalSewaLapangan: b.totalSewaLapangan.toString(),
    totalAddons: b.totalAddons.toString(), diskon: b.diskon.toString(),
    grandTotal: b.grandTotal.toString(), uangDp: b.uangDp.toString(), sisaBayar: b.sisaBayar.toString(),
    items: b.items.map(i => ({ ...i, hargaSatuan: i.hargaSatuan.toString(), subtotal: i.subtotal.toString() })),
    payments: b.payments.map(p => ({ ...p, jumlah: p.jumlah.toString() }))
  })));
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  const d = parsed.data;
  const startM = timeToMinutes(d.jamMulai), endM = timeToMinutes(d.jamSelesai);
  if (endM <= startM || startM < 360 || endM > 1320) return NextResponse.json({ error: "Jam tidak valid. Pilih jadwal antara 06.00 dan 22.00." }, { status: 400 });
  const bookingDate = new Date(`${d.tanggalMain}T00:00:00.000Z`);
  if (Number.isNaN(bookingDate.getTime())) return NextResponse.json({ error: "Tanggal tidak valid." }, { status: 400 });
  if (d.tanggalMain < new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })) return NextResponse.json({ error: "Tanggal main tidak boleh di masa lalu." }, { status: 400 });
  try {
    const result = await prisma.$transaction(async tx => {
      const court = await tx.court.findUnique({ where: { id: d.courtId } });
      if (!court || !court.statusAktif) throw new Error("Lapangan tidak ditemukan atau tidak aktif.");
      const sameDay = await tx.booking.findMany({
        where: { courtId: d.courtId, tanggalMain: bookingDate, statusBooking: { not: "DIBATALKAN" } },
        select: { jamMulai: true, jamSelesai: true }
      });
      if (sameDay.some(b => isOverlapping(d.jamMulai, d.jamSelesai, b.jamMulai, b.jamSelesai))) throw new Error("Jadwal bentrok. Silakan pilih waktu lain.");
      const duration = (endM - startM) / 60;
      const courtCost = calculateCourtCost(d.jamMulai, d.jamSelesai, Number(court.tarifRegulerPerJam), Number(court.tarifMalamPerJam));
      const itemIds = [...new Set(d.items.map(i => i.addonId))];
      const addons = itemIds.length ? await tx.addon.findMany({ where: { id: { in: itemIds }, aktif: true } }) : [];
      if (addons.length !== itemIds.length) throw new Error("Ada perlengkapan yang tidak ditemukan atau tidak aktif.");
      const itemRows = d.items.map(item => {
        const addon = addons.find(a => a.id === item.addonId)!;
        if (item.kuantiti > addon.stok) throw new Error(`Stok ${addon.namaItem} tidak mencukupi.`);
        return { addonId: addon.id, hargaSatuan: addon.hargaSatuan, kuantiti: item.kuantiti, subtotal: Number(addon.hargaSatuan) * item.kuantiti };
      });
      const addonTotal = itemRows.reduce((sum, item) => sum + item.subtotal, 0);
      const discount = Math.min(d.diskon, courtCost + addonTotal);
      const grandTotal = courtCost + addonTotal - discount;
      if (d.uangDp > grandTotal) throw new Error("DP tidak boleh melebihi total tagihan.");
      const statusBayar = d.uangDp >= grandTotal && grandTotal > 0 ? "LUNAS" : d.uangDp > 0 ? "DP" : "BELUM_BAYAR";
      const statusBooking = d.uangDp > 0 ? "TERKONFIRMASI" : "MENUNGGU_DP";
      const created = await tx.booking.create({
        data: {
          noBooking: `TMP-${Date.now()}-${Math.floor(Math.random()*100000)}`,
          namaPemesan: d.namaPemesan, namaTim: d.namaTim || null, noHp: d.noHp,
          courtId: d.courtId, tanggalMain: bookingDate, jamMulai: d.jamMulai, jamSelesai: d.jamSelesai,
          durasiJam: duration, totalSewaLapangan: courtCost, totalAddons: addonTotal,
          diskon: discount, grandTotal, uangDp: d.uangDp, sisaBayar: grandTotal-d.uangDp,
          statusBayar, statusBooking,
          items: { create: itemRows.map(i => ({ addonId: i.addonId, hargaSatuan: i.hargaSatuan, kuantiti: i.kuantiti, subtotal: i.subtotal })) },
          ...(d.uangDp > 0 ? { payments: { create: { jumlah: d.uangDp, metode: "DP", catatan: "Pembayaran awal saat booking" } } } : {})
        }
      });
      const noBooking = makeBookingNumber(created.id, new Date());
      return tx.booking.update({ where: { id: created.id }, data: { noBooking }, include: { court: true, items: { include: { addon: true } } } });
    }, { isolationLevel: "Serializable", maxWait: 10000, timeout: 20000 });
    return NextResponse.json({ ok: true, booking: { id: result.id, noBooking: result.noBooking, grandTotal: result.grandTotal.toString(), sisaBayar: result.sisaBayar.toString() } }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal menyimpan booking.";
    return NextResponse.json({ error: message.includes("Unique constraint") ? "Nomor booking bentrok. Silakan ulangi." : message }, { status: 400 });
  }
}
