import { describe, test, expect } from 'vitest';
import type { 
  MarketSummaryData, 
  StockCardData, 
  StockSymbol, 
  AIEvaluation,
  ChatSession,
  Watchlist 
} from './index';

describe('@investie/types', () => {
  test('should export all required types', () => {
    // Test that core types are exported and can be used
    const mockMarketData: MarketSummaryData = {
      fearGreedIndex: { value: 50, status: 'neutral', source: 'claude_search' },
      vix: { value: 20, status: 'medium', source: 'google_finance' },
      interestRate: { value: 5.0, aiOutlook: 'Test outlook', source: 'fred_api' },
      cpi: { value: 3.0, monthOverMonth: 0.1, direction: 'up', source: 'fred_api' },
      unemploymentRate: { value: 4.0, monthOverMonth: 0.0, source: 'fred_api' },
      sp500Sparkline: { data: [100, 101, 102], weeklyTrend: 'up', source: 'google_finance' }
    };

    expect(mockMarketData.fearGreedIndex.value).toBe(50);
    expect(mockMarketData.vix.status).toBe('medium');
  });

  test('should validate StockSymbol type', () => {
    const validSymbols: StockSymbol[] = [
      'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 
      'NVDA', 'META', 'NFLX', 'AVGO', 'AMD'
    ];
    
    expect(validSymbols).toHaveLength(10);
    expect(validSymbols).toContain('AAPL');
    expect(validSymbols).toContain('AMD');
  });

  test('should create valid AIEvaluation object', () => {
    const aiEval: AIEvaluation = {
      summary: 'Test AI evaluation summary',
      rating: 'bullish',
      confidence: 85,
      keyFactors: ['Factor 1', 'Factor 2', 'Factor 3'],
      timeframe: '3M',
      source: 'claude_ai',
      lastUpdated: '2025-02-03T10:30:00Z'
    };

    expect(aiEval.confidence).toBeGreaterThanOrEqual(0);
    expect(aiEval.confidence).toBeLessThanOrEqual(100);
    expect(aiEval.keyFactors).toHaveLength(3);
  });

  test('should create valid ChatSession object', () => {
    const session: ChatSession = {
      sessionId: 'test-session-123',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'What is the market outlook?',
          timestamp: '2025-02-03T10:30:00Z',
          context: 'market'
        }
      ],
      isActive: true,
      lastActivity: '2025-02-03T10:30:00Z'
    };

    expect(session.messages).toHaveLength(1);
    expect(session.messages[0].role).toBe('user');
    expect(session.isActive).toBe(true);
  });

  test('should create valid Watchlist object', () => {
    const watchlist: Watchlist = {
      userId: 'user-123',
      items: [
        {
          symbol: 'AAPL',
          addedAt: '2025-02-03T10:30:00Z',
          order: 1
        },
        {
          symbol: 'TSLA',
          addedAt: '2025-02-03T10:31:00Z',
          customName: 'Tesla Motors',
          order: 2
        }
      ],
      maxItems: 10,
      lastUpdated: '2025-02-03T10:31:00Z'
    };

    expect(watchlist.items).toHaveLength(2);
    expect(watchlist.maxItems).toBe(10);
    expect(watchlist.items[0].symbol).toBe('AAPL');
    expect(watchlist.items[1].customName).toBe('Tesla Motors');
  });
});