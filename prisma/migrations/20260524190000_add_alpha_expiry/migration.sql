-- AlterTable
ALTER TABLE "alpha_purchases" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ;
