/*
  Warnings:

  - The values [COINBASE_ONCHAIN_VERIFICATIONS] on the enum `Frame_matchingCriteria` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Frame` MODIFY `matchingCriteria` ENUM('RECEIPTS_XYZ_ALL_TIME_RUNNING', 'COINBASE_ONCHAIN_VERIFICATIONS_COUNTRY', 'COINBASE_ONCHAIN_VERIFICATIONS_ONE', 'ALL') NOT NULL DEFAULT 'ALL';
