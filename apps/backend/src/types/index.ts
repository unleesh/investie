// Embedded types for production deployment
// This replaces @investie/types dependency

export type StockSymbol = 'AAPL' | 'TSLA' | 'MSFT' | 'GOOGL' | 'AMZN' | 'NVDA' | 'META' | 'NFLX' | 'AVGO' | 'AMD';

export interface MarketSummaryData {
  fearGreedIndex: {
    value: number;
    status: 'fear' | 'neutral' | 'greed';
    source: string;
  };
  vix: {
    value: number;
    status: 'low' | 'medium' | 'high';
    source: string;
  };
  interestRate: {
    value: number;
    aiOutlook: string;
    source: string;
  };
  cpi: {
    value: number;
    monthOverMonth: number;
    direction: 'up' | 'down' | 'stable';
    source: string;
  };
  unemploymentRate: {
    value: number;
    monthOverMonth: number;
    source: string;
  };
  sp500Sparkline: {
    data: number[];
    weeklyTrend: 'up' | 'down' | 'flat';
    source: string;
  };
}

export interface StockCardData {
  symbol: StockSymbol;
  name: string;
  price: {
    current: number;
    change: number;
    changePercent: number;
    source: string;
  };
  priceChart: {
    period: '1D' | '1W' | '1M' | '3M' | '1Y';
    data: Array<{
      timestamp: string;
      price: number;
    }>;
    trend: 'up' | 'down' | 'flat';
    change: number;
    changePercent: number;
    source: string;
  };
  fundamentals: {
    pe: number;
    marketCap: number;
    volume: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    source: string;
  };
  technicals: {
    rsi: number;
    rsiStatus: 'oversold' | 'neutral' | 'overbought';
  };
  aiEvaluation: AIEvaluation;
  newsSummary: {
    headline: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    source: string;
  };
  sectorPerformance: {
    name: string;
    weeklyChange: number;
    source: string;
  };
}

export interface AIEvaluation {
  summary: string;
  rating: 'bullish' | 'neutral' | 'bearish';
  confidence: number;
  keyFactors: string[];
  timeframe: '1W' | '1M' | '3M';
  source: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  relatedSymbol?: StockSymbol;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  context?: string;
  sessionId?: string;
  lastActivity?: string;
  isActive?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  relatedSymbol?: StockSymbol;
  context?: string;
}

export interface FearGreedIndex {
  value: number;
  status: 'fear' | 'neutral' | 'greed';
  source: string;
}

export interface StockTechnicals {
  rsi: number;
  rsiStatus: 'oversold' | 'neutral' | 'overbought';
  macd?: number;
  sma20?: number;
  sma50?: number;
}

export interface StockNewsSummary {
  headline: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
  publishedAt?: string;
  summary?: string;
}