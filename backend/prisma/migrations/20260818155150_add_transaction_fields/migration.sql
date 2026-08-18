/*
  Warnings:

  - Added the required column `balance_after` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance_before` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "balance_after" INTEGER NOT NULL,
ADD COLUMN     "balance_before" INTEGER NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
