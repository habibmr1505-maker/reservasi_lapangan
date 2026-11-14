import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  if (!await getSession()) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const { id: rawId } = await context.params; const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const schema = z.discriminatedUnion("action", [
    z.object({ action: z.literal("pay"), jumlah: z.coerce.number().positive(), metode: z.enum(["TUNAI","TRANSFER","QRIS"]).default("TUNAI") }),
    z.object({ action: z.literal("status"), statusBooking: z.enum(["SEDANG_BERMAIN","SELESAI"]) }),
    z.object({ action: z.literal("cancel"), alasan: z.string().trim().min(5).max(255) })
  ]);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Permintaan tidak valid." }, { status: 400 });
  try {
    const result = await prisma.$transaction(async tx => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) throw new Error("Booking tidak ditemukan.");
      if (booking.statusBooking === "DIBATALKAN") throw new Error("Booking sudah dibatalkan.");
      const action = parsed.data;
      if (action.action === "pay") {
        const remaining = Number(booking.sisaBayar);
        if (action.jumlah > remaining) throw new Error("Pembayaran melebihi sisa tagihan.");
        const paid = Number(booking.uangDp) + action.jumlah;
        const balance = Number(booking.grandTotal) - paid;
        await tx.payment.create({ data: { bookingId: id, jumlah: action.jumlah, metode: action.metode } });
        return tx.booking.update({ where: { id }, data: { uangDp: paid, sisaBayar: Math.max(0,balance), statusBayar: balance <= 0 ? "LUNAS" : "DP" } });
      }
      if (action.action === "status") {
        if (booking.sisaBayar.toNumber() > 0 && action.statusBooking === "SELESAI") throw new Error("Tagihan harus lunas sebelum booking diselesaikan.");
        return tx.booking.update({ where: { id }, data: { statusBooking: action.statusBooking } });
      }
      if (booking.statusBooking === "SELESAI") throw new Error("Booking yang sudah selesai tidak dapat dibatalkan.");
      return tx.booking.update({ where: { id }, data: { statusBooking: "DIBATALKAN", alasanPembatalan: action.alasan } });
    });
    return NextResponse.json({ ok: true, booking: { id: result.id, statusBooking: result.statusBooking, statusBayar: result.statusBayar, sisaBayar: result.sisaBayar.toString() } });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Transaksi gagal." }, { status: 400 }); }
}
