// ===================================
// API & Generic Helper Types
// ===================================
export type Status = 'low' | 'medium' | 'high' | 'fear' | 'neutral' | 'greed' | 'oversold' | 'overbought';
export type Trend = 'up' | 'down' | 'flat';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  source: string;
}

// ===================================
// Market Summary Card Types
// ===================================
export interface FearGreedIndex {
  value: number;
  status: 'fear' | 'neutral' | 'greed';
  source: 'claude_search';
}

export interface Vix {
  value: number;
  status: 'low' | 'medium' | 'high';
  source: 'google_finance';
}

export interface InterestRate {
  value: number;
  aiOutlook: string; // Claude-generated text
  source: 'fred_api';
}

export interface Cpi {
  value: number;
  monthOverMonth: number;
  direction: 'up' | 'down';
  source: 'fred_api';
}

export interface UnemploymentRate {
  value: number;
  monthOverMonth: number;
  source: 'fred_api';
}

export interface SP500Sparkline {
  data: number[];
  weeklyTrend: 'up' | 'down' | 'flat';
  source: 'google_finance';
}

export interface MarketSummaryData {
  fearGreedIndex: FearGreedIndex;
  vix: Vix;
  interestRate: InterestRate;
  cpi: Cpi;
  unemploymentRate: UnemploymentRate;
  sp500Sparkline: SP500Sparkline;
}

// ===================================
// Individual Stock Card Types
// ===================================
export type StockSymbol = 'AAPL' | 'TSLA' | 'MSFT' | 'GOOGL' | 'AMZN' | 'NVDA' | 'META' | 'NFLX' | 'AVGO' | 'AMD';

export interface StockPrice {
  current: number;
  change: number;
  changePercent: number;
  source: 'google_finance';
}

export interface StockFundamentals {
  pe: number;
  marketCap: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  source: 'google_finance';
}

export interface StockTechnicals {
  rsi: number;
  rsiStatus: 'oversold' | 'neutral' | 'overbought';
}

export interface StockNewsSummary {
  headline: string; // Claude-generated one-liner
  sentiment: 'positive' | 'neutral' | 'negative';
  source: 'google_news + claude_ai';
}

export interface SectorPerformance {
  name: string;
  weeklyChange: number;
  source: 'google_finance';
}

// Stock Price Chart Types
export interface StockPricePoint {
  timestamp: string; // ISO date string
  price: number;
  volume?: number;
}

export interface StockPriceChart {
  period: '1D' | '1W' | '1M' | '3M' | '1Y';
  data: StockPricePoint[];
  trend: 'up' | 'down' | 'flat';
  change: number;
  changePercent: number;
  source: 'google_finance';
}

// AI Evaluation Types
export interface AIEvaluation {
  summary: string; // 2-3 sentence comprehensive AI analysis
  rating: 'bullish' | 'neutral' | 'bearish';
  confidence: number; // 0-100 confidence score
  keyFactors: string[]; // Array of 3-4 key factors influencing the rating
  timeframe: '1W' | '1M' | '3M'; // Evaluation timeframe
  source: 'claude_ai';
  lastUpdated: string; // ISO timestamp
}

export interface StockCardData {
  symbol: StockSymbol;
  name: string;
  price: StockPrice;
  priceChart: StockPriceChart;
  fundamentals: StockFundamentals;
  technicals: StockTechnicals;
  aiEvaluation: AIEvaluation; // AI comprehensive evaluation before news
  newsSummary: StockNewsSummary;
  sectorPerformance: SectorPerformance;
}

// AI Chatbot Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: 'market' | 'stock' | 'general';
  relatedSymbol?: StockSymbol;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  isActive: boolean;
  lastActivity: string;
}

export interface ChatbotState {
  isOpen: boolean;
  isLoading: boolean;
  currentSession: ChatSession | null;
  recentSessions: ChatSession[];
}

// User Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'google' | 'facebook' | 'github' | 'email';
  createdAt: string;
  lastLoginAt: string;
}

// Watchlist Management Types
export interface WatchlistItem {
  symbol: StockSymbol;
  addedAt: string;
  customName?: string; // User-defined stock name
  order: number; // Order within the list
}

export interface Watchlist {
  userId: string;
  items: WatchlistItem[];
  maxItems: number; // Maximum number of stocks (default 10)
  lastUpdated: string;
}