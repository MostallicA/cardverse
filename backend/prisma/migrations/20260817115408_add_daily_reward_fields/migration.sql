-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "daily_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_daily_claim" TIMESTAMP(3);
