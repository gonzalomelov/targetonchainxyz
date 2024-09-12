/*
  Warnings:

  - Added the required column `variantFormattedPrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `variantFormattedPrice` VARCHAR(191) NOT NULL;
