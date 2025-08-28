/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('RETAILER', 'RESELLER', 'ADMIN') NOT NULL DEFAULT 'RETAILER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `totalSpent` DOUBLE NOT NULL DEFAULT 0,
    `totalOrders` INTEGER NOT NULL DEFAULT 0,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `commission` DOUBLE NULL,
    `totalEarnings` DOUBLE NULL,
    `referralCode` VARCHAR(191) NULL,
    `referredBy` VARCHAR(191) NULL,
    `downlineCount` INTEGER NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `refreshTokenExpires` DATETIME(3) NULL,
    `otpSecret` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_referralCode_key`(`referralCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `type` ENUM('DIAMOND', 'WEEKLY', 'MONTHLY', 'SPECIAL', 'SUBSCRIPTION') NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `discount` DOUBLE NULL,
    `amount` INTEGER NULL,
    `duration` INTEGER NULL,
    `region` VARCHAR(191) NOT NULL,
    `gameName` VARCHAR(191) NOT NULL,
    `vendor` VARCHAR(191) NOT NULL,
    `vendorPackageCode` VARCHAR(191) NOT NULL,
    `vendorPrice` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
    `stock` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currencies` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `flag` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `currencies_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_rates` (
    `id` VARCHAR(191) NOT NULL,
    `fromCurrency` VARCHAR(191) NOT NULL,
    `toCurrency` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL,
    `trend` ENUM('UP', 'DOWN', 'STABLE') NOT NULL DEFAULT 'STABLE',
    `change24h` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exchange_rates_fromCurrency_toCurrency_key`(`fromCurrency`, `toCurrency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('RETAILER_XCOIN_PURCHASE', 'RETAILER_PACKAGE_PURCHASE', 'RESELLER_XCOIN_REQUEST', 'RESELLER_BULK_PURCHASE', 'VENDOR_EXCHANGE') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PROCESSING') NOT NULL DEFAULT 'PENDING',
    `xCoinAmount` DOUBLE NULL,
    `totalCost` DOUBLE NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `notes` VARCHAR(191) NULL,
    `adminNotes` VARCHAR(191) NULL,
    `packageId` VARCHAR(191) NULL,
    `gameUserId` VARCHAR(191) NULL,
    `serverId` VARCHAR(191) NULL,
    `playerName` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `fromCurrency` VARCHAR(191) NULL,
    `fromAmount` DOUBLE NULL,
    `exchangeRate` DOUBLE NULL,
    `processingFee` DOUBLE NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `paymentReference` VARCHAR(191) NULL,
    `requestedAmount` DOUBLE NULL,
    `approvedAmount` DOUBLE NULL,
    `paymentProof` VARCHAR(191) NULL,
    `externalPaymentRef` VARCHAR(191) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `vendorName` VARCHAR(191) NULL,
    `vendorCurrency` VARCHAR(191) NULL,
    `vendorCoinAmount` DOUBLE NULL,
    `vendorTransactionId` VARCHAR(191) NULL,
    `relatedTransactionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `xcoin_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('PURCHASE', 'SPEND', 'REFUND') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `fromCurrency` VARCHAR(191) NULL,
    `fromAmount` DOUBLE NULL,
    `rate` DOUBLE NULL,
    `fees` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PROCESSING') NOT NULL DEFAULT 'PENDING',
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exchange_rates` ADD CONSTRAINT `exchange_rates_fromCurrency_fkey` FOREIGN KEY (`fromCurrency`) REFERENCES `currencies`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exchange_rates` ADD CONSTRAINT `exchange_rates_toCurrency_fkey` FOREIGN KEY (`toCurrency`) REFERENCES `currencies`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `xcoin_transactions` ADD CONSTRAINT `xcoin_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
