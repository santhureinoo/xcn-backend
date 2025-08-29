/*
  Warnings:

  - You are about to drop the column `packageId` on the `transactions` table. All the data in the column will be lost.
  - The values [RESELLER_XCOIN_REQUEST,VENDOR_EXCHANGE] on the enum `transactions_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_packageId_fkey`;

-- DropIndex
DROP INDEX `transactions_packageId_fkey` ON `transactions`;

-- AlterTable
ALTER TABLE `packages` ADD COLUMN `resellKeyword` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transactions` DROP COLUMN `packageId`,
    MODIFY `type` ENUM('RETAILER_XCOIN_PURCHASE', 'RETAILER_PACKAGE_PURCHASE', 'RESELLER_BULK_PURCHASE') NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `downlineCount` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `transaction_packages` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `transaction_packages_transactionId_packageId_key`(`transactionId`, `packageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `gameUserId` VARCHAR(191) NOT NULL,
    `serverId` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NULL,
    `packageKeywords` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `totalAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VendorCall` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `vendorName` VARCHAR(191) NOT NULL,
    `vendorPackageCode` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `vendorResponse` JSON NULL,
    `vendorOrderId` VARCHAR(191) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction_packages` ADD CONSTRAINT `transaction_packages_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_packages` ADD CONSTRAINT `transaction_packages_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendorCall` ADD CONSTRAINT `VendorCall_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
