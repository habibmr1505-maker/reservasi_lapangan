
import { PrismaClient, Role, AddonType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Membuat password yang sudah di-hash
    const adminHash = await bcrypt.hash("Admin123!", 12);
    const kasirHash = await bcrypt.hash("Kasir123!", 12);

    // 2. Membuat akun administrator
    await prisma.user.upsert({
      where: {
        username: "admin",
      },
      update: {},
      create: {
        username: "admin",
        namaLengkap: "Administrator",
        passwordHash: adminHash,
        role: Role.ADMIN,
      },
    });

    // 3. Membuat akun kasir
    await prisma.user.upsert({
      where: {
        username: "kasir",
      },
      update: {},
      create: {
        username: "kasir",
        namaLengkap: "Petugas Kasir",
        passwordHash: kasirHash,
        role: Role.KASIR,
      },
    });

    // 4. Data lapangan
    const courts = [
      {
        namaLapangan: "Futsal 1",
        jenisOlahraga: "Futsal",
        tarifRegulerPerJam: 100000,
        tarifMalamPerJam: 125000,
      },
      {
        namaLapangan: "Futsal 2",
        jenisOlahraga: "Futsal",
        tarifRegulerPerJam: 100000,
        tarifMalamPerJam: 125000,
      },
      {
        namaLapangan: "Badminton A",
        jenisOlahraga: "Badminton",
        tarifRegulerPerJam: 50000,
        tarifMalamPerJam: 65000,
      },
    ];

    for (const court of courts) {
      await prisma.court.upsert({
        where: { id: await getCourtId(court.namaLapangan) },
        update: {},
        create: court,
      });
    }

    // 5. Data perlengkapan dan produk
    const addons = [
      {
        namaItem: "Bola Futsal",
        tipe: AddonType.SEWA,
        hargaSatuan: 15000,
        stok: 10,
      },
      {
        namaItem: "Rompi Tim",
        tipe: AddonType.SEWA,
        hargaSatuan: 10000,
        stok: 30,
      },
      {
        namaItem: "Air Mineral",
        tipe: AddonType.JUAL,
        hargaSatuan: 5000,
        stok: 100,
      },
    ];

    for (const addon of addons) {
      const existing = await prisma.addon.findFirst({
        where: { namaItem: addon.namaItem },
      });

      if (!existing) {
        await prisma.addon.create({
          data: addon,
        });
      }
    }

    console.log("Seed berhasil dijalankan!");
    console.log("Login Admin: admin / Admin123!");
    console.log("Login Kasir: kasir / Kasir123!");
  } catch (error) {
    console.error("Terjadi kesalahan saat menjalankan seed:", error);
    throw error;
  }
}

// Mendapatkan ID lapangan berdasarkan nama
async function getCourtId(namaLapangan: string): Promise<number> {
  const court = await prisma.court.findFirst({
    where: { namaLapangan },
    select: { id: true },
  });

  // ID -1 tidak digunakan oleh database auto-increment.
  // Jika belum ada, upsert akan mencoba membuat data baru.
  return court?.id ?? -1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
