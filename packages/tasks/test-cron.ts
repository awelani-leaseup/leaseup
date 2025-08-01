// Simple test script to run the Effect-based cron every 10 seconds
// Run with: tsx test-cron.ts

import { runStandaloneTestCron } from './src/effect/send-monthly-invoices';

console.log('🚀 Starting test cron runner...');
console.log('📅 This will advance TestClock by 1 month every 10 seconds');
console.log("🕐 Each iteration advances Effect's TestClock forward by 30 days");
console.log('⏹️  Press Ctrl+C to stop\n');

async function main() {
  try {
    console.log('About to call runStandaloneTestCron...');
    const result = await runStandaloneTestCron();
    console.log('runStandaloneTestCron completed with result:', result);
  } catch (error) {
    console.error('Test cron failed:', error);
    console.error('Error stack:', error?.stack);
    process.exit(1);
  }
}

main();
