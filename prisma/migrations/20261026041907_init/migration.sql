-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(60) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `nama_lengkap` VARCHAR(120) NOT NULL,
    `role` ENUM('ADMIN', 'KASIR') NOT NULL DEFAULT 'KASIR',
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lapangan` VARCHAR(100) NOT NULL,
    `jenis_olahraga` VARCHAR(60) NOT NULL,
    `tarif_reguler_per_jam` DECIMAL(12, 2) NOT NULL,
    `tarif_malam_per_jam` DECIMAL(12, 2) NOT NULL,
    `status_aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_item` VARCHAR(100) NOT NULL,
    `tipe` ENUM('SEWA', 'JUAL') NOT NULL DEFAULT 'SEWA',
    `harga_satuan` DECIMAL(12, 2) NOT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `aktif` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `no_booking` VARCHAR(40) NOT NULL,
    `nama_pemesan` VARCHAR(120) NOT NULL,
    `nama_tim` VARCHAR(120) NULL,
    `no_hp` VARCHAR(30) NOT NULL,
    `court_id` INTEGER NOT NULL,
    `tanggal_main` DATE NOT NULL,
    `jam_mulai` VARCHAR(5) NOT NULL,
    `jam_selesai` VARCHAR(5) NOT NULL,
    `durasi_jam` DECIMAL(5, 2) NOT NULL,
    `total_sewa_lapangan` DECIMAL(12, 2) NOT NULL,
    `total_addons` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `diskon` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `grand_total` DECIMAL(12, 2) NOT NULL,
    `uang_dp` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `sisa_bayar` DECIMAL(12, 2) NOT NULL,
    `status_bayar` ENUM('BELUM_BAYAR', 'DP', 'LUNAS', 'REFUND') NOT NULL DEFAULT 'BELUM_BAYAR',
    `status_booking` ENUM('MENUNGGU_DP', 'TERKONFIRMASI', 'SEDANG_BERMAIN', 'SELESAI', 'DIBATALKAN') NOT NULL DEFAULT 'MENUNGGU_DP',
    `alasan_pembatalan` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bookings_no_booking_key`(`no_booking`),
    INDEX `bookings_court_id_tanggal_main_jam_mulai_jam_selesai_idx`(`court_id`, `tanggal_main`, `jam_mulai`, `jam_selesai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_addons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `addon_id` INTEGER NOT NULL,
    `harga_satuan` DECIMAL(12, 2) NOT NULL,
    `kuantiti` INTEGER NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `jumlah` DECIMAL(12, 2) NOT NULL,
    `metode` VARCHAR(30) NOT NULL,
    `catatan` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_court_id_fkey` FOREIGN KEY (`court_id`) REFERENCES `courts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_addons` ADD CONSTRAINT `booking_addons_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_addons` ADD CONSTRAINT `booking_addons_addon_id_fkey` FOREIGN KEY (`addon_id`) REFERENCES `addons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
