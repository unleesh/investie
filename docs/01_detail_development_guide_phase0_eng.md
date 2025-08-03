Investie Phase 0: Project Leader Preparation Guide (📱 Mobile + 🌐 Web)
🎯 Goal
The objective is to provide both front-end and back-end engineers with a single monorepo skeleton that boots React Native (mobile app) and Next.js 14 (responsive web) side-by-side. This structure shares types, mock data, and utilities, enabling all four developers to start working in parallel from day one.

📂 0. Monorepo Layout
This project will be set up as a monorepo using Nx workspaces. This is key to maximizing code reusability and maintaining consistency.

Bash

investie/
├── apps/
│   ├── mobile/        # React-Native (Expo) Application
│   ├── web/           # Next.js 14 Application
│   └── backend/       # NestJS API Server
├── packages/
│   ├── types/         # Shared TypeScript Types (The Contract)
│   ├── mock/          # Shared Mock Data (JSON files)
│   └── utils/         # Shared Helper Functions (Stubs)
└── package.json       # Root scripts and dependency management
🧬 1. Shared Package Setup
1.1. packages/types (Shared Type Definitions)
This package serves as the "Single Source of Truth" between the front-end and back-end. If a new field is needed, a Pull Request must be made to this type file first.

TypeScript

// packages/types/src/index.ts

// API & Generic Types
export type Status = 'low' | 'medium' | 'high' | 'fear' | 'neutral' | 'greed' | 'oversold' | 'overbought';
export type Trend = 'up' | 'down' | 'flat';

// Market Summary Card Types
export interface MarketSummaryData {
  fearGreedIndex: { value: number; status: 'fear' | 'neutral' | 'greed' };
  vix: { value: number; status: 'low' | 'medium' | 'high' };
  interestRate: { value: number; aiOutlook: string };
  cpi: { value: number; monthOverMonth: number; direction: 'up' | 'down' };
  unemploymentRate: { value: number; monthOverMonth: number };
  sp500Sparkline: { data: number[]; weeklyTrend: 'up' | 'down' | 'flat' };
}

// Individual Stock Card Types
export type StockSymbol = 'AAPL' | 'TSLA' | 'MSFT' | 'GOOGL' | 'AMZN' | 'NVDA' | 'META' | 'NFLX' | 'AVGO' | 'AMD';

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
  price: { current: number; change: number; changePercent: number };
  priceChart: StockPriceChart; // NEW: Historical price chart data
  fundamentals: { pe: number; marketCap: number; volume: number; fiftyTwoWeekHigh: number; fiftyTwoWeekLow: number };
  technicals: { rsi: number; rsiStatus: 'oversold' | 'neutral' | 'overbought' };
  aiEvaluation: AIEvaluation; // NEW: AI comprehensive evaluation before news
  newsSummary: { headline: string; sentiment: 'positive' | 'neutral' | 'negative' };
  sectorPerformance: { name: string; weeklyChange: number };
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
1.2. packages/mock (Mock Data)
These are small JSON fixtures that will power both front-end apps during Phase 0.

packages/mock/src/market-summary.json

JSON

{
  "fearGreedIndex": { "value": 38, "status": "fear" },
  "vix": { "value": 17.5, "status": "medium" },
  "interestRate": { "value": 5.33, "aiOutlook": "The Fed is expected to hold rates steady through the next quarter." },
  "cpi": { "value": 3.4, "monthOverMonth": 0.1, "direction": "up" },
  "unemploymentRate": { "value": 3.9, "monthOverMonth": 0.1 },
  "sp500Sparkline": { "data": [4780, 4785, 4790, 4770, 4795, 4805, 4800], "weeklyTrend": "up" }
}
packages/mock/src/stocks.json

JSON

{
  "AAPL": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": { "current": 195.89, "change": 2.34, "changePercent": 1.21 },
    "priceChart": {
      "period": "1W",
      "data": [
        { "timestamp": "2025-01-27T16:00:00Z", "price": 192.45 },
        { "timestamp": "2025-01-28T16:00:00Z", "price": 193.21 },
        { "timestamp": "2025-01-29T16:00:00Z", "price": 191.78 },
        { "timestamp": "2025-01-30T16:00:00Z", "price": 194.12 },
        { "timestamp": "2025-01-31T16:00:00Z", "price": 193.55 },
        { "timestamp": "2025-02-03T16:00:00Z", "price": 195.89 }
      ],
      "trend": "up",
      "change": 3.44,
      "changePercent": 1.79,
      "source": "google_finance"
    },
    "fundamentals": { "pe": 28.5, "marketCap": 3050000000000, "volume": 45680000, "fiftyTwoWeekHigh": 199.62, "fiftyTwoWeekLow": 164.08 },
    "technicals": { "rsi": 62, "rsiStatus": "neutral" },
    "aiEvaluation": {
      "summary": "Apple maintains strong fundamentals with robust ecosystem growth and Services revenue expansion. Vision Pro represents significant innovation catalyst despite initial supply constraints. iPhone demand stabilizing with upgrade cycle momentum building for Q2.",
      "rating": "bullish",
      "confidence": 85,
      "keyFactors": ["Services revenue growth", "Vision Pro market potential", "iPhone upgrade cycle", "Strong cash position"],
      "timeframe": "3M",
      "source": "claude_ai",
      "lastUpdated": "2025-02-03T10:30:00Z"
    },
    "newsSummary": { "headline": "Analysts remain bullish on Vision Pro sales projections.", "sentiment": "positive" },
    "sectorPerformance": { "name": "Technology", "weeklyChange": 2.1 }
  }
  // ...add mock data for the other 9 stocks (each with priceChart and aiEvaluation fields)
}
1.3. packages/utils (Utility Function Stubs)
Define the structure for shared utilities, like formatters. The logic will be implemented later.

TypeScript

// packages/utils/src/formatters.ts
export const formatCurrency = (value: number) => { /* TODO */ };
export const formatPercentage = (value: number) => { /* TODO */ };
🏗️ 2. Application Skeleton Setup
2.1. Frontend (Mobile + Web)
Both the mobile and web apps will be scaffolded with identical component APIs to establish a foundation for code sharing.

🔹 React-Native (apps/mobile)
TypeScript

// apps/mobile/src/components/ui/Card.tsx
import { View } from 'react-native';
export const Card = ({ children }) => <View>{children}</View>;

// apps/mobile/src/components/charts/LineChart.tsx
import { View, Text } from 'react-native';
export const LineChart = () => <View><Text>Line Chart Stub</Text></View>;

// apps/mobile/src/components/charts/StockPriceChart.tsx
import { View, Text } from 'react-native';
export const StockPriceChart = ({ data }) => <View><Text>Stock Price Chart Stub</Text></View>;

// apps/mobile/src/components/ai/AIEvaluationCard.tsx
import { View, Text } from 'react-native';
export const AIEvaluationCard = ({ evaluation }) => <View><Text>AI Evaluation Stub</Text></View>;

// apps/mobile/src/components/ai/AIChatbot.tsx (Modal/Bottom Sheet for mobile)
import { View, Text } from 'react-native';
export const AIChatbot = () => <View><Text>AI Chatbot Stub</Text></View>;
🔸 Next.js (apps/web)
The web app will use the Next.js 14 App Router. Component APIs will mirror the mobile app's structure.

TypeScript

// apps/web/src/components/ui/Card.tsx
export const Card = ({ children }) => <div>{children}</div>;

// apps/web/src/components/charts/LineChart.tsx
export const LineChart = () => <div>Line Chart Stub</div>;

// apps/web/src/components/charts/StockPriceChart.tsx
export const StockPriceChart = ({ data }) => <div>Stock Price Chart Stub</div>;

// apps/web/src/components/ai/AIEvaluationCard.tsx
export const AIEvaluationCard = ({ evaluation }) => <div>AI Evaluation Stub</div>;

// apps/web/src/components/ai/AIChatbot.tsx (Right sidebar for web)
export const AIChatbot = () => <div>AI Chatbot Stub</div>;

// apps/web/app/page.tsx
import { MarketSummaryCard } from '@/components/cards/MarketSummaryCard'; // Example

export default function Home() {
  return (
    <main>
      <h1>Hello Investie Web</h1>
      {/* <MarketSummaryCard /> */}
    </main>
  );
}
2.2. Backend (apps/backend)
NestJS service and controller stubs will be created to initially serve the mock data.

TypeScript

// apps/backend/src/market/market.service.ts
import { Injectable } from '@nestjs/common';
import * as marketSummaryMock from '@investie/mock/src/market-summary.json';
import * as stocksMock from '@investie/mock/src/stocks.json';
import { MarketSummaryData, StockCardData, StockSymbol } from '@investie/types';

@Injectable()
export class MockDataService {
  getMarketSummary(): MarketSummaryData {
    return marketSummaryMock;
  }
  getStock(symbol: StockSymbol): StockCardData {
    return stocksMock[symbol];
  }
}
🚀 3. Developer Scripts
Set up the root package.json to launch all development environments with a single command.

JSON

{
  "scripts": {
    "dev": "concurrently \"npm:dev:mobile\" \"npm:dev:web\" \"npm:dev:backend\"",
    "dev:mobile": "nx run mobile:start",
    "dev:web": "nx run web:dev",
    "dev:backend": "nx run backend:start:dev",
    "typecheck": "tsc -b"
  }
}
✅ 4. Phase 0 Completion Checklist
All items must be checked off before proceeding to the Phase 1 task board.

[x] packages/types compiles successfully with the tsc -p packages/types command.

[x] The npm run dev command spawns Expo, Next.js, and the NestJS backend without any errors.

[x] The mobile app launches in the simulator and displays the "Hello Investie Mobile" placeholder.

[x] The web homepage (http://localhost:3001) displays the "Hello Investie Web" placeholder.

[x] The backend endpoints /api/v1/market-summary and /api/v1/stocks/AAPL return a 200 OK status with the corresponding mock JSON data.

[x] All stub components and services export correctly, passing the ESLint check.

[x] All four developers have cloned the repository, run npm install, and successfully executed npm run dev.

## 🎉 Current Implementation Status (Updated)

### ✅ Backend Implementation Complete
**Phase 0 ➜ Phase 1 ➜ Phase 2 - FULLY IMPLEMENTED**

#### BE1 (Financial Data) - ✅ COMPLETE
- ✅ FinancialDataService with FRED API integration (CPI, Interest Rate, Unemployment)
- ✅ Google Finance API integration (VIX, S&P500 data)  
- ✅ MarketDataScheduler for periodic updates
- ✅ Redis caching strategy (24-hour cache for economic indicators)
- ✅ StocksService with getStockBySymbol method
- ✅ HistoricalDataService for stock chart data (1D, 1W, 1M, 3M, 1Y)
- ✅ 5-minute caching for stock data, 1-hour for chart data
- ✅ Complete API endpoints: `/api/v1/stocks/:symbol`, `/api/v1/stocks`

#### BE2 (News & AI) - ✅ COMPLETE  
- ✅ AiContentService with Claude Search API (Fear & Greed Index)
- ✅ Claude API integration for Interest Rate AI Outlook
- ✅ AIEvaluationService for comprehensive stock analysis
- ✅ NewsService with Google News + Claude API integration
- ✅ RSI calculation and technical analysis
- ✅ ChatService with session management and context awareness  
- ✅ Complete chat API endpoints: `/api/v1/chat/sessions/*`
- ✅ Redis caching strategy: 12h for AI content, 6h for news, 1h for chat

#### Integrated Backend Architecture - ✅ COMPLETE
- ✅ BE1 + BE2 data integration in StocksService
- ✅ Market Summary with AI-enhanced Fear & Greed Index
- ✅ Stock Cards with AI evaluation + news + RSI + price charts
- ✅ Complete fallback system with mock data
- ✅ Comprehensive caching across all services
- ✅ All 10 target stocks (AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META, NFLX, AVGO, AMD)

### 🔧 Available API Endpoints
```bash
# Core Market Data (AI Enhanced)
GET /api/v1/market-summary     # Market data with AI Fear & Greed + Interest Rate Outlook

# Stock Data (Fully Integrated)  
GET /api/v1/stocks             # All 10 stocks with complete BE1+BE2 data
GET /api/v1/stocks/:symbol     # Individual stock with AI evaluation + news + RSI
GET /api/v1/stocks/:symbol/chart?period=1W  # Historical chart data

# AI Chatbot System
POST /api/v1/chat/sessions     # Create new chat session
POST /api/v1/chat/sessions/:id/messages  # Send message to AI
GET  /api/v1/chat/sessions/:id # Get session history
GET  /api/v1/chat/sessions     # List recent sessions
DELETE /api/v1/chat/sessions/:id  # End session

# Health & Status
GET /api/v1/health             # Backend health check
GET /api/v1/chat/health        # Chat service health
```

### 🗂️ Current Data Structure (Fully Implemented)
All mock data includes complete BE1 + BE2 fields:
- ✅ Market Summary: Real-time Fear & Greed + AI Interest Rate Outlook
- ✅ Stock Cards: Price charts + AI evaluations + News summaries + RSI
- ✅ Chat System: Session-based AI investment assistant

### 📋 Ready for Frontend Development
With BE1 and BE2 complete, frontend developers can now:
1. Build MarketSummaryCard with real AI-enhanced data
2. Create StockCard components with integrated price charts and AI evaluations  
3. Implement AI chatbot interface (web sidebar, mobile modal)
4. Focus on UI/UX without waiting for backend API development
5. Use live backend endpoints or fallback to comprehensive mock data

### 🔑 Production Requirements
For full AI functionality, set these API keys:
```bash
CLAUDE_API_KEY=your-claude-api-key
GOOGLE_NEWS_API_KEY=your-news-api-key  
GOOGLE_FINANCE_API_KEY=your-finance-api-key
FRED_API_KEY=your-fred-api-key
```

ℹ️ Notes for Phase 1 Planning
Code Sharing: Chart and UI component APIs are identical across mobile and web, allowing for their gradual extraction into a shared packages/ui during Phase 1.

Styling: The Tailwind configuration is shared. The mobile app uses NativeWind, while the web app uses Tailwind CSS 3.

Responsive Design: Investing early in a useBreakpoint helper hook is recommended so that the desktop, tablet, and mobile web views can all reuse the same layout primitives.