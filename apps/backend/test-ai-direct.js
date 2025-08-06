// Direct test of AI-based overview generation
require('dotenv').config();

async function testAIOverview() {
  try {
    // Get stock symbol from command line arguments
    const symbol = process.argv[2];
    
    if (!symbol) {
      console.log('❌ Please provide a stock symbol');
      console.log('Usage: node test-ai-direct.js <SYMBOL>');
      console.log('Example: node test-ai-direct.js AAPL');
      process.exit(1);
    }
    
    // Import the compiled service
    const { NewsService } = require('./dist/news/news.service.js');
    
    console.log(`🚀 Testing AI-based overview generation for ${symbol.toUpperCase()}...`);
    
    // Create service instance
    const newsService = new NewsService();
    
    // Test with the provided symbol
    const result = await newsService.processStockNews(symbol.toUpperCase());
    
    console.log('\n📊 RESULT:');
    console.log(`Valid: ${result.isValid}`);
    
    if (result.isValid && result.overview) {
      console.log(`Symbol: ${result.symbol}`);
      console.log(`Recommendation: ${result.overview.recommendation}`);
      console.log(`Confidence: ${result.overview.confidence}%`);
      console.log(`Source: ${result.overview.source}`);
      console.log(`Overview: ${result.overview.overview}`);
      console.log(`Key Factors: ${result.overview.keyFactors.join(', ')}`);
    } else {
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testAIOverview();
