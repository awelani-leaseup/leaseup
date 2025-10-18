import { testDb } from './database.js';

async function globalTeardown() {
  console.log('Starting global test teardown...');

  try {
    await testDb.stop();
    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('Global teardown failed:', error);
    // Don't throw here to avoid masking test failures
  }
}

export default globalTeardown;
