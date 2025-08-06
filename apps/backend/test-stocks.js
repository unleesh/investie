// Direct test of Stocks module
require('dotenv').config();

async function testStocksModule() {
  try {
    console.log('🚀 Testing Stocks module functionality...');
    
    // Import the compiled service
    const { StocksService } = require('./dist/stocks/stocks.service.js');
    const { SerpApiService } = require('./dist/services/serpapi.service.js');
    const { NewsService } = require('./dist/news/news.service.js');
    
    // Create service instances (mocking dependencies)
    const serpApiService = new SerpApiService();
    const newsService = new NewsService();
    const stocksService = new StocksService(serpApiService, newsService);
    
    console.log('\n📊 Testing getAllStocks()...');
    const allStocks = await stocksService.getAllStocks();
    console.log(`✅ Retrieved ${allStocks.length} stocks`);
    console.log(`Sample stock: ${allStocks[0]?.symbol} - ${allStocks[0]?.name} - $${allStocks[0]?.price?.current}`);
    
    console.log('\n📊 Testing getStock() for AAPL...');
    const appleStock = await stocksService.getStock('AAPL');
    if (appleStock) {
      console.log(`✅ AAPL Stock Data:`);
      console.log(`  Name: ${appleStock.name}`);
      console.log(`  Price: $${appleStock.price.current}`);
      console.log(`  Change: ${appleStock.price.change} (${appleStock.price.changePercent}%)`);
      console.log(`  PE Ratio: ${appleStock.fundamentals.pe}`);
      console.log(`  Market Cap: ${appleStock.fundamentals.marketCap}`);
      console.log(`  AI Evaluation: ${appleStock.aiEvaluation.recommendation} (${appleStock.aiEvaluation.confidence}%)`);
    } else {
      console.log('❌ Failed to get AAPL stock data');
    }
    
    console.log('\n📊 Testing getStockSync() for TSLA...');
    const teslaStock = stocksService.getStockSync('TSLA');
    if (teslaStock) {
      console.log(`✅ TSLA Stock Data (sync):`);
      console.log(`  Name: ${teslaStock.name}`);
      console.log(`  Price: $${teslaStock.price.current}`);
      console.log(`  Change: ${teslaStock.price.change} (${teslaStock.price.changePercent}%)`);
    } else {
      console.log('❌ Failed to get TSLA stock data');
    }
    
    console.log('\n✅ All stocks module tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Stocks module test failed:', error.message);
    console.error(error.stack);
  }
}

testStocksModule();
