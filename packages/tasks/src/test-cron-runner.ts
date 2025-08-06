#!/usr/bin/env node

import { runStandaloneTestCron } from './effect/send-monthly-invoices';

// Test cron runner using Effect's TestClock for testing purposes
// This advances the TestClock by 1 month every iteration to simulate monthly cycles

async function main() {
  console.log('🧪 Starting Effect-based TEST monthly invoices cron runner...');
  console.log('🕐 Using TestClock - will advance by 1 month each iteration');
  console.log('⚠️  This is for testing only - no real delays applied');

  try {
    await runStandaloneTestCron();

    console.log('🟡 Test cron runner completed successfully');
  } catch (error) {
    console.error('❌ Test cron runner failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Gracefully shutting down test cron runner...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Gracefully shutting down test cron runner...');
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
