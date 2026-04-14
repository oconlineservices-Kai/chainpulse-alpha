-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "wallet_address" TEXT,
    "premium_status" TEXT NOT NULL DEFAULT 'free',
    "premium_expires_at" TIMESTAMP(3),
    "credits" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "provider_payment_id" TEXT NOT NULL,
    "provider_subscription_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "credits_added" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alpha_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "signal_id" TEXT NOT NULL,
    "credits_used" INTEGER NOT NULL DEFAULT 1,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alpha_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "token_name" TEXT,
    "sentiment_score" INTEGER,
    "whale_confidence" INTEGER,
    "correlation_score" INTEGER,
    "is_diamond_signal" BOOLEAN NOT NULL DEFAULT false,
    "twitter_mentions" INTEGER,
    "whale_wallets" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_provider_payment_id_idx" ON "transactions"("provider_payment_id");

-- CreateIndex
CREATE INDEX "alpha_purchases_user_id_idx" ON "alpha_purchases"("user_id");

-- CreateIndex
CREATE INDEX "alpha_purchases_signal_id_idx" ON "alpha_purchases"("signal_id");

-- CreateIndex
CREATE INDEX "signals_token_symbol_idx" ON "signals"("token_symbol");

-- CreateIndex
CREATE INDEX "signals_created_at_idx" ON "signals"("created_at");

-- CreateIndex
CREATE INDEX "signals_is_diamond_signal_idx" ON "signals"("is_diamond_signal");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alpha_purchases" ADD CONSTRAINT "alpha_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alpha_purchases" ADD CONSTRAINT "alpha_purchases_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
