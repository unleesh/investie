import { describe, test, expect } from 'vitest';
import { 
  marketSummary, 
  stocks, 
  getMarketSummary, 
  getStock, 
  getAllStocks, 
  getStocksBySymbols,
  marketSummaryMock,
  stocksMock
} from './index';
import type { StockSymbol } from '@investie/types';

describe('@investie/mock', () => {
  test('should export market summary data', () => {
    expect(marketSummary).toBeDefined();
    expect(marketSummary.fearGreedIndex).toBeDefined();
    expect(marketSummary.fearGreedIndex.value).toBe(38);
    expect(marketSummary.fearGreedIndex.status).toBe('fear');
    expect(marketSummary.fearGreedIndex.source).toBe('claude_search');
  });

  test('should export all 10 stocks', () => {
    const allStocks = getAllStocks();
    expect(allStocks).toHaveLength(10);
    
    const expectedSymbols: StockSymbol[] = [
      'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 
      'NVDA', 'META', 'NFLX', 'AVGO', 'AMD'
    ];
    
    expectedSymbols.forEach(symbol => {
      const stock = getStock(symbol);
      expect(stock).toBeDefined();
      expect(stock?.symbol).toBe(symbol);
    });
  });

  test('should validate stock data structure', () => {
    const appleStock = getStock('AAPL');
    expect(appleStock).toBeDefined();
    
    if (appleStock) {
      // Check basic info
      expect(appleStock.name).toBe('Apple Inc.');
      expect(appleStock.symbol).toBe('AAPL');
      
      // Check price data
      expect(appleStock.price.current).toBe(195.89);
      expect(appleStock.price.source).toBe('google_finance');
      
      // Check price chart
      expect(appleStock.priceChart).toBeDefined();
      expect(appleStock.priceChart.period).toBe('1W');
      expect(appleStock.priceChart.data).toHaveLength(6);
      expect(appleStock.priceChart.trend).toBe('up');
      
      // Check AI evaluation
      expect(appleStock.aiEvaluation).toBeDefined();
      expect(appleStock.aiEvaluation.rating).toBe('bullish');
      expect(appleStock.aiEvaluation.confidence).toBe(85);
      expect(appleStock.aiEvaluation.keyFactors).toHaveLength(4);
      expect(appleStock.aiEvaluation.source).toBe('claude_ai');
      
      // Check fundamentals
      expect(appleStock.fundamentals.source).toBe('google_finance');
      expect(appleStock.fundamentals.pe).toBe(28.5);
      
      // Check news summary
      expect(appleStock.newsSummary.source).toBe('google_news + claude_ai');
      expect(appleStock.newsSummary.sentiment).toBe('positive');
      
      // Check sector performance
      expect(appleStock.sectorPerformance.source).toBe('google_finance');
      expect(appleStock.sectorPerformance.name).toBe('Technology');
    }
  });

  test('should get stocks by symbols', () => {
    const techStocks = getStocksBySymbols(['AAPL', 'MSFT', 'GOOGL']);
    expect(techStocks).toHaveLength(3);
    expect(techStocks[0].symbol).toBe('AAPL');
    expect(techStocks[1].symbol).toBe('MSFT');
    expect(techStocks[2].symbol).toBe('GOOGL');
  });

  test('should return undefined for invalid stock symbol', () => {
    const invalidStock = getStock('INVALID' as StockSymbol);
    expect(invalidStock).toBeUndefined();
  });

  test('should validate market summary structure', () => {
    const market = getMarketSummary();
    
    // Check Fear & Greed Index
    expect(market.fearGreedIndex.value).toBeGreaterThanOrEqual(0);
    expect(market.fearGreedIndex.value).toBeLessThanOrEqual(100);
    expect(['fear', 'neutral', 'greed']).toContain(market.fearGreedIndex.status);
    
    // Check VIX
    expect(market.vix.value).toBeGreaterThan(0);
    expect(['low', 'medium', 'high']).toContain(market.vix.status);
    
    // Check Interest Rate
    expect(market.interestRate.value).toBeGreaterThan(0);
    expect(market.interestRate.aiOutlook).toBeTruthy();
    expect(market.interestRate.source).toBe('fred_api');
    
    // Check CPI
    expect(market.cpi.value).toBeGreaterThan(0);
    expect(['up', 'down']).toContain(market.cpi.direction);
    
    // Check S&P 500 Sparkline
    expect(market.sp500Sparkline.data).toHaveLength(7);
    expect(['up', 'down', 'flat']).toContain(market.sp500Sparkline.weeklyTrend);
  });

  test('should export raw JSON data', () => {
    expect(marketSummaryMock).toBeDefined();
    expect(stocksMock).toBeDefined();
    expect(stocksMock.AAPL).toBeDefined();
    expect(Object.keys(stocksMock)).toHaveLength(10);
  });

  test('should validate all stocks have required AI evaluations', () => {
    const allStocks = getAllStocks();
    
    allStocks.forEach(stock => {
      expect(stock.aiEvaluation).toBeDefined();
      expect(stock.aiEvaluation.summary).toBeTruthy();
      expect(['bullish', 'neutral', 'bearish']).toContain(stock.aiEvaluation.rating);
      expect(stock.aiEvaluation.confidence).toBeGreaterThanOrEqual(0);
      expect(stock.aiEvaluation.confidence).toBeLessThanOrEqual(100);
      expect(stock.aiEvaluation.keyFactors.length).toBeGreaterThanOrEqual(3);
      expect(stock.aiEvaluation.keyFactors.length).toBeLessThanOrEqual(4);
      expect(stock.aiEvaluation.source).toBe('claude_ai');
    });
  });

  test('should validate all stocks have price charts', () => {
    const allStocks = getAllStocks();
    
    allStocks.forEach(stock => {
      expect(stock.priceChart).toBeDefined();
      expect(stock.priceChart.period).toBe('1W');
      expect(stock.priceChart.data).toHaveLength(6);
      expect(['up', 'down', 'flat']).toContain(stock.priceChart.trend);
      expect(stock.priceChart.source).toBe('google_finance');
      
      // Validate price data points
      stock.priceChart.data.forEach(point => {
        expect(point.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        expect(point.price).toBeGreaterThan(0);
      });
    });
  });
});