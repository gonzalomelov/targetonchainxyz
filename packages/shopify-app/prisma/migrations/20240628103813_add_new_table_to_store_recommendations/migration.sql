-- CreateTable
CREATE TABLE `UserProduct` (
    `walletAddress` VARCHAR(191) NOT NULL,
    `frameId` INTEGER NOT NULL,
    `productId1` VARCHAR(191) NOT NULL,
    `productId2` VARCHAR(191) NOT NULL,
    `productId3` VARCHAR(191) NOT NULL,

    INDEX `UserProduct_walletAddress_frameId_idx`(`walletAddress`, `frameId`),
    PRIMARY KEY (`walletAddress`, `frameId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
