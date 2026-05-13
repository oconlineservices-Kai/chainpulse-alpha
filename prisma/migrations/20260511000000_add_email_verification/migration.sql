-- AlterTable: Add email verification columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_expires" TIMESTAMP(3);
