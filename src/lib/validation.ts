import { z } from "zod";

export const bookingSchema = z.object({
  namaPemesan: z.string().trim().min(2, "Nama pemesan minimal 2 karakter").max(120),
  namaTim: z.string().trim().max(120).optional().or(z.literal("")),
  noHp: z.string().trim().min(8, "Nomor telepon minimal 8 karakter").max(30),
  courtId: z.coerce.number().int().positive(),
  tanggalMain: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  jamMulai: z.string().regex(/^\d{2}:\d{2}$/),
  jamSelesai: z.string().regex(/^\d{2}:\d{2}$/),
  uangDp: z.coerce.number().min(0),
  diskon: z.coerce.number().min(0).default(0),
  items: z.array(z.object({
    addonId: z.coerce.number().int().positive(),
    kuantiti: z.coerce.number().int().positive().max(100)
  })).default([])
});
