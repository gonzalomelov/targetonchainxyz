/*
  Warnings:

  - Added the required column `button` to the `Frame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Frame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Frame` ADD COLUMN `button` VARCHAR(191) NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NOT NULL;
