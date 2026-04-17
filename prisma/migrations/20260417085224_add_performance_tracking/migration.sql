-- AlterTable
ALTER TABLE "signals" ADD COLUMN     "current_price" DOUBLE PRECISION,
ADD COLUMN     "entry_price" DOUBLE PRECISION,
ADD COLUMN     "hours_tracked" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "last_performance_update" TIMESTAMP(3),
ADD COLUMN     "performance_status" TEXT,
ADD COLUMN     "price_change_pct" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "signals_performance_status_idx" ON "signals"("performance_status");
