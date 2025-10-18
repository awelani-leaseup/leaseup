import { testDb } from './database.js';

async function globalSetup() {
  console.log('Starting global test setup...');

  try {
    await testDb.start();
    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
