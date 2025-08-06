// Test setup for E2E tests
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file for tests
config({ path: join(__dirname, '../.env') });

// Set default test environment variables if not provided
if (!process.env.CLAUDE_API_KEY) {
  process.env.CLAUDE_API_KEY = 'test-claude-key';
}

if (!process.env.SERPAPI_API_KEY) {
  process.env.SERPAPI_API_KEY = 'test-serpapi-key';
}

if (!process.env.FRED_API_KEY) {
  process.env.FRED_API_KEY = 'test-fred-key';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

console.log('🧪 Test environment setup complete');
console.log(`📊 API Keys loaded: CLAUDE=${!!process.env.CLAUDE_API_KEY}, SERPAPI=${!!process.env.SERPAPI_API_KEY}, FRED=${!!process.env.FRED_API_KEY}`);