// Test the backend API endpoints
const axios = require('axios');

async function testBackendAPI() {
  console.log('🚀 Testing Backend API Endpoints...');
  
  const baseURL = 'http://localhost:3001';
  const symbols = ['AAPL', 'TSLA', 'NVDA'];

  for (const symbol of symbols) {
    try {
      console.log(`\n🔍 Testing /api/v1/stocks/${symbol}`);
      const response = await axios.get(`${baseURL}/api/v1/stocks/${symbol}`, {
        timeout: 15000, // Longer timeout for news API calls
      });

      const stock = response.data;
      console.log(`✅ ${stock.name} (${stock.symbol})`);
      console.log(`💰 Price: $${stock.price.current} (${stock.price.changePercent > 0 ? '+' : ''}${stock.price.changePercent}%)`);
      
      if (stock.newsSummary) {
        console.log(`📰 News: ${stock.newsSummary.headline}`);
        console.log(`😊 Sentiment: ${stock.newsSummary.sentiment}`);
        console.log(`🔗 Source: ${stock.newsSummary.source}`);
      } else {
        console.log('❌ No news summary available');
      }
    } catch (error) {
      console.log(`❌ Error testing ${symbol}:`, error.message);
    }
  }
}

// Test if backend is running first
async function checkBackend() {
  try {
    await axios.get('http://localhost:3001/api/v1/health', { timeout: 5000 });
    console.log('✅ Backend is running');
    return true;
  } catch (error) {
    console.log('❌ Backend not running. Start it with: npm run start:dev');
    return false;
  }
}

async function main() {
  if (await checkBackend()) {
    await testBackendAPI();
  }
}

main();