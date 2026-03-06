/*
  Warnings:

  - You are about to drop the column `memberId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_memberId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "memberId";
