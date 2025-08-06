#!/usr/bin/env node

import { runStandaloneCron } from './effect/send-monthly-invoices';

// Standalone cron runner using Effect's built-in scheduling
// This replaces the need for trigger.dev for this specific task

async function main() {
  console.log('🚀 Starting Effect-based monthly invoices cron runner...');
  console.log(
    '⏰ Schedule: 0 5 * * * (5 minutes past midnight, Johannesburg time)'
  );

  try {
    await runStandaloneCron();

    // 🚨 Add this to keep the process alive
    console.log('🟡 runStandaloneCron completed — entering idle loop...');
    setInterval(() => {
      console.log(`🕰️ Still running at ${new Date().toISOString()}`);
    }, 60_000); // every minute
  } catch (error) {
    console.error('❌ Cron runner failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Gracefully shutting down cron runner...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Gracefully shutting down cron runner...');
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
