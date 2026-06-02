// Applies the webhook_events table migration via Prisma's $executeRawUnsafe
// This avoids needing the prisma CLI in the container.
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Check if table already exists
    const exists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'webhook_events'
      );
    `);
    
    if (exists[0]?.exists) {
      console.log('webhook_events table already exists — skipping migration');
      return;
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "webhook_events" (
        "id" TEXT NOT NULL,
        "event_id" TEXT NOT NULL,
        "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "webhook_events_event_id_key" ON "webhook_events"("event_id");
    `);

    console.log('Migration applied: webhook_events table created');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
