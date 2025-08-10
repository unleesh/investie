# 📊 Investie - Complete Development Guide

## 🎯 Project Overview

Investie is a comprehensive investment analysis platform with a **TradingView-integrated frontend** and **API-first NestJS backend**. The project follows a monorepo architecture with shared types and utilities, designed for real-time stock analysis with AI-powered insights.

### Architecture Components

```
investie/
├── apps/
│   ├── mobile/          # React Native/Expo (Future Implementation)
│   ├── web/             # Next.js 14 + TradingView Widgets
│   └── backend/         # NestJS API Server (API-First Architecture)
├── packages/
│   ├── types/           # Shared TypeScript Types
│   ├── mock/            # Development Mock Data
│   └── utils/           # Shared Helper Functions
└── infrastructure/      # Railway Deployment + Environment Config
```

---

## 🏗️ Backend Architecture (API-First)

### Core Principles
- **API-First**: All data requires real API keys - no mock fallbacks in production
- **Real-Time Data**: SerpApi (Google Finance) + FRED API + Claude AI
- **TradingView Compatible**: Data format optimized for `NASDAQ:SYMBOL` format
- **Microservices Design**: Modular service architecture with dependency injection

### Service Architecture

#### 1. **Data Services**
```typescript
// SerpApiService - Stock Data & News
class SerpApiService {
  async getStockData(symbol: string, exchange = 'NASDAQ'): Promise<StockData>
  async getStockNews(symbol: string): Promise<NewsData[]>
  async getChartData(symbol: string, period = '1W'): Promise<ChartData>
}

// FinancialDataService - Economic Indicators
class FinancialDataService {
  async getEconomicIndicators(): Promise<EconomicData>
  async getMarketIndices(): Promise<MarketData>
}

// ClaudeService - AI Analysis
class ClaudeService {
  async generateStockEvaluation(symbol: string): Promise<AIEvaluation>
  async generateResponse(prompt: string): Promise<string>
}
```

#### 2. **Business Logic Services**
```typescript
// StocksService - Main Stock Data Orchestration
class StocksService {
  async getAllStocks(): Promise<StockCardData[]>
  async getStock(symbol: StockSymbol): Promise<StockCardData | null>
  async getStockChart(symbol: StockSymbol, period: string): Promise<ChartData>
}

// MarketService - Market Summary with AI
class MarketService {
  async getSummary(): Promise<MarketSummaryData>
  async getMarketSentimentAnalysis(): Promise<SentimentData>
}

// TechnicalAnalysisService - RSI & Technical Indicators
class TechnicalAnalysisService {
  async getAnalysis(symbol: string): Promise<StockTechnicals>
  calculateRSI(prices: number[], period = 14): StockTechnicals
}
```

### API Endpoints

#### Stock Data Endpoints
```bash
GET  /api/v1/stocks                    # All 10 target stocks
GET  /api/v1/stocks/:symbol            # Individual stock (AAPL, TSLA, etc.)
GET  /api/v1/stocks/:symbol/chart      # Historical chart data
```

#### Market Data Endpoints
```bash
GET  /api/v1/market-summary            # Market overview with AI insights
GET  /api/v1/market-summary/health     # Market service health check
POST /api/v1/market-summary/force-update # Manual cache refresh
```

#### AI Chat System
```bash
POST /api/v1/chat/sessions             # Create chat session
POST /api/v1/chat/sessions/:id/messages # Send message
GET  /api/v1/chat/sessions/:id         # Get session history
```

### Data Model (TypeScript)

#### Core Stock Data Structure
```typescript
interface StockCardData {
  symbol: StockSymbol;
  name: string;
  price: {
    current: number;
    change: number;
    changePercent: number;
    source: 'google_finance';
  };
  fundamentals: {
    pe: number;
    marketCap: number;
    volume: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
  };
  aiEvaluation: AIEvaluation;
  technicals: StockTechnicals;
  newsSummary: StockNewsSummary;
  sectorPerformance: {
    name: string;
    weeklyChange: number;
  };
}

interface AIEvaluation {
  rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number; // 0-100
  summary: string;
  keyFactors: string[];
  timeframe: '1M' | '3M' | '1Y';
  source: 'claude_ai';
  lastUpdated: string;
}

type StockSymbol = 'AAPL' | 'TSLA' | 'MSFT' | 'GOOGL' | 'AMZN' 
                 | 'NVDA' | 'META' | 'NFLX' | 'AVGO' | 'AMD';
```

#### Market Summary Structure
```typescript
interface MarketSummaryData {
  fearGreedIndex: {
    value: number;
    status: 'fear' | 'neutral' | 'greed';
    source: string;
  };
  vix: {
    value: number;
    status: 'low' | 'medium' | 'high';
  };
  interestRate: {
    value: number;
    aiOutlook: string; // Claude AI analysis
  };
  cpi: {
    value: number;
    monthOverMonth: number;
    direction: 'up' | 'down' | 'stable';
  };
}
```

---

## 🎨 Frontend Architecture (TradingView Integration)

### Design System
- **Framework**: Next.js 15.4.5 with App Router
- **Styling**: Tailwind CSS 4.x
- **Charts**: TradingView Widgets (External Embedding)
- **Layout**: CSS Grid with responsive design

### Frontend Structure Analysis

#### Layout Grid System
```css
/* Main Grid Layout - From styles.css */
main {
  display: grid;
  max-width: 1080px;
  grid-template-columns: 1fr 1fr;
  grid-gap: var(--gap-size);
}

/* Component Spanning Rules */
.span-one-column {
  grid-column: span 1;  /* Symbol Info, Technical Analysis */
}

.span-full-grid {
  grid-column: span 2;  /* Advanced Chart, Fundamental Data, etc. */
}
```

#### TradingView Widget Components

##### 1. **Ticker Tape** (Market Overview)
```javascript
// Market indices ticker - Top navigation
{
  "symbols": [
    {"proName": "FRED:DJIA", "title": "Dow Jones"},
    {"proName": "SPREADEX:SPX", "title": "S&P 500"},
    {"proName": "NASDAQ:IXIC", "title": "NASDAQ"}
  ]
}
```

##### 2. **Symbol Info Widget** (Stock Price Display)
```javascript
// Main stock price display - Left column
{
  "symbol": "NASDAQ:AAPL",
  "colorTheme": "light",
  "width": "50%"
}
```

##### 3. **Technical Analysis Widget** (RSI, Indicators)
```javascript
// Technical indicators - Right column  
{
  "symbol": "NASDAQ:AAPL",
  "displayMode": "multiple",
  "interval": "1D",
  "showIntervalTabs": true
}
```

##### 4. **Advanced Chart Widget** (Main Chart)
```javascript
// Full-width interactive chart
{
  "symbol": "NASDAQ:AAPL", 
  "allow_symbol_change": true,
  "interval": "D",
  "theme": "light"
}
```

##### 5. **Fundamental Data Widget** (Financial Metrics)
```javascript
// Company financials display
{
  "symbol": "NASDAQ:AAPL",
  "displayMode": "regular"
}
```

### Component Heights (From CSS Analysis)
```css
#ticker-tape         { height: 170px; }
#symbol-info         { height: 480px; }
#technical-analysis  { height: 480px; }
#advanced-chart      { height: 600px; }
#company-profile     { height: 300px; }
#fundamental-data    { height: 490px; }
#top-stories         { height: 425px; }
```

### Frontend-Backend Integration

#### Data Sync Strategy
```typescript
// Frontend expects TradingView-compatible symbol format
const symbol = "NASDAQ:AAPL";  // Not just "AAPL"

// Backend API calls
const stockData = await fetch(`/api/v1/stocks/${symbol.split(':')[1]}`);
const chartData = await fetch(`/api/v1/stocks/${symbol.split(':')[1]}/chart?period=1W`);

// Real-time updates
const marketSummary = await fetch('/api/v1/market-summary');
```

---

## 🚀 Complete Implementation Guide

### Phase 1: Backend Setup (API-First)

#### 1.1 Environment Setup
```bash
# Create project structure
mkdir -p investie/{apps/{backend,web,mobile},packages/{types,mock,utils}}
cd investie

# Initialize backend
cd apps/backend
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install --save-dev @nestjs/cli typescript @types/node
```

#### 1.2 Required API Keys
```bash
# .env file - DO NOT COMMIT TO GIT
SERPAPI_API_KEY=your-serpapi-key-for-google-finance
CLAUDE_API_KEY=your-claude-api-key-for-ai-analysis  
FRED_API_KEY=your-fred-api-key-for-economic-data

# Cache Configuration
REDIS_HOST=your-redis-host
ECONOMIC_DATA_TTL=86400  # 24 hours
STOCK_DATA_TTL=300       # 5 minutes
AI_CONTENT_TTL=43200     # 12 hours
```

#### 1.3 Core Services Implementation

##### SerpApi Integration (Critical - Fixed Data Extraction)
```typescript
// apps/backend/src/services/serpapi.service.ts
@Injectable()
export class SerpApiService {
  async getStockData(symbol: string, exchange = 'NASDAQ') {
    const result = await getJson({
      engine: 'google_finance',
      api_key: this.apiKey,
      q: `${symbol}:${exchange}`,
    });
    
    // CRITICAL: Use extracted_price, not price field
    return {
      price: result.summary.extracted_price,        // NOT result.summary.price
      change: result.summary.market.price_movement.value,
      changePercent: result.summary.market.price_movement.percentage
    };
  }
}
```

##### Stock Service Orchestration
```typescript
// apps/backend/src/stocks/stocks.service.ts
@Injectable()
export class StocksService {
  async getStock(symbol: StockSymbol): Promise<StockCardData | null> {
    const [stockData, newsData, aiEvaluation, technicalData] = 
      await Promise.allSettled([
        this.serpApiService.getStockData(symbol, 'NASDAQ'),
        this.serpApiService.getStockNews(symbol),
        this.claudeService.generateStockEvaluation(symbol),
        this.technicalService.getAnalysis(symbol)
      ]);
    
    return this.transformToStockCardData(stockData, newsData, aiEvaluation, technical, symbol);
  }
}
```

#### 1.4 API Endpoints Implementation
```typescript
// apps/backend/src/stocks/stocks.controller.ts
@Controller('api/v1/stocks')
export class StocksController {
  @Get()
  async getAllStocks(): Promise<StockCardData[]> {
    return await this.stocksService.getAllStocks();
  }

  @Get(':symbol')
  async getStock(@Param('symbol') symbol: StockSymbol): Promise<StockCardData | null> {
    return await this.stocksService.getStock(symbol);
  }
}
```

### Phase 2: Frontend Setup (TradingView Integration)

#### 2.1 Next.js Project Setup
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app
npm install recharts  # For custom charts if needed
```

#### 2.2 TradingView Widget Integration
```typescript
// components/TradingViewWidget.tsx
export function TradingViewSymbolInfo({ symbol }: { symbol: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: `NASDAQ:${symbol}`,
      colorTheme: 'light',
      isTransparent: true,
      width: '100%'
    });
    
    const container = document.querySelector('.tradingview-widget-container__widget');
    container?.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
```

#### 2.3 Layout Implementation
```typescript
// app/stocks/[symbol]/page.tsx
export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  return (
    <div className="stock-detail-layout">
      {/* Ticker Tape - Top */}
      <nav className="ticker-tape">
        <TradingViewTickerTape />
      </nav>
      
      {/* Main Grid Layout */}
      <main className="main-grid">
        {/* Left Column */}
        <section className="span-one-column">
          <TradingViewSymbolInfo symbol={params.symbol} />
        </section>
        
        {/* Right Column */} 
        <section className="span-one-column">
          <TradingViewTechnicalAnalysis symbol={params.symbol} />
        </section>
        
        {/* Full Width Components */}
        <section className="span-full-grid">
          <TradingViewAdvancedChart symbol={params.symbol} />
        </section>
        
        <section className="span-full-grid">
          <TradingViewFundamentalData symbol={params.symbol} />
        </section>
      </main>
    </div>
  );
}
```

#### 2.4 Styling (Tailwind + Custom CSS)
```css
/* globals.css - Based on analyzed styles.css */
:root {
  --gap-size: 32px;
}

.main-grid {
  display: grid;
  max-width: 1080px;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap-size);
}

.span-one-column {
  grid-column: span 1;
}

.span-full-grid {
  grid-column: span 2;
}

@media (max-width: 800px) {
  .span-one-column {
    grid-column: span 2;
  }
}
```

### Phase 3: Data Integration

#### 3.1 API Client Setup
```typescript
// lib/api-client.ts
export class InvestieAPIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  async getStock(symbol: string): Promise<StockCardData> {
    const response = await fetch(`${this.baseURL}/api/v1/stocks/${symbol}`);
    return response.json();
  }
  
  async getMarketSummary(): Promise<MarketSummaryData> {
    const response = await fetch(`${this.baseURL}/api/v1/market-summary`);
    return response.json();
  }
}
```

#### 3.2 Real-Time Updates
```typescript
// hooks/useStockData.ts
export function useStockData(symbol: string) {
  const [data, setData] = useState<StockCardData | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const stockData = await apiClient.getStock(symbol);
      setData(stockData);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  return data;
}
```

### Phase 4: Deployment (Railway)

#### 4.1 Railway Configuration
```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ['nodejs_20']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm run start:prod'
```

#### 4.2 Environment Variables (Railway Dashboard)
```bash
# Production Environment Variables
SERPAPI_API_KEY=<your-production-serpapi-key>
CLAUDE_API_KEY=<your-production-claude-key>
FRED_API_KEY=<your-production-fred-key>

NODE_ENV=production
DEBUG_MODE=false
PORT=3000
```

#### 4.3 Deployment Commands
```bash
# Connect to Railway
npm install -g @railway/cli
railway login
railway link

# Deploy
git push origin main  # Automatic deployment

# Monitor
railway logs --follow
```

---

## 🧪 Testing & Validation

### Backend API Testing
```bash
# Health Check
curl https://your-app.railway.app/api/v1/health

# Stock Data Test
curl https://your-app.railway.app/api/v1/stocks/AAPL | jq .price

# Market Summary Test  
curl https://your-app.railway.app/api/v1/market-summary | jq .fearGreedIndex
```

### Expected Data Format
```json
{
  "symbol": "AAPL",
  "price": {
    "current": 229.35,
    "change": 0.61,
    "changePercent": 0.27
  },
  "aiEvaluation": {
    "rating": "buy", 
    "confidence": 75,
    "summary": "Strong fundamentals with growth potential"
  }
}
```

---

## 🔧 Development Commands

### Backend Development
```bash
cd apps/backend

# Development
npm run start:dev          # Start with hot reload
npm run build             # Build for production
npm run test              # Run tests
npm run lint              # Code linting

# API Testing
./test-endpoints.sh       # Test all endpoints
./check-api-keys.sh       # Verify API key status
```

### Frontend Development  
```bash
cd apps/web

# Development
npm run dev               # Next.js development server
npm run build             # Production build
npm run typecheck         # TypeScript checking
```

### Full Stack Development
```bash
# Root directory
npm run dev               # Start all services concurrently
npm run build             # Build all packages and apps
npm run typecheck         # Type check everything
```

---

## 🎯 Target Stock Symbols

The platform focuses on 10 major tech stocks:
- **AAPL** (Apple Inc.)
- **TSLA** (Tesla Inc.) 
- **MSFT** (Microsoft Corp.)
- **GOOGL** (Alphabet Inc.)
- **AMZN** (Amazon.com Inc.)
- **NVDA** (NVIDIA Corp.)
- **META** (Meta Platforms Inc.)
- **NFLX** (Netflix Inc.)
- **AVGO** (Broadcom Inc.)
- **AMD** (Advanced Micro Devices)

Each stock includes:
- ✅ Real-time price data (SerpApi)
- ✅ AI-powered analysis (Claude)
- ✅ Technical indicators (RSI, etc.)
- ✅ News summaries 
- ✅ TradingView chart integration

---

## 📊 Success Metrics

### Backend Performance Targets
- **API Response Time**: <200ms average
- **Uptime**: 99.9% availability
- **Data Freshness**: Stock prices <5min old
- **AI Analysis**: <30s generation time

### Frontend Performance Targets
- **Page Load Time**: <3s on 3G
- **Widget Load Time**: <2s per TradingView widget
- **Real-time Updates**: 30s refresh interval
- **Mobile Responsive**: Full functionality on mobile

This comprehensive guide provides everything needed to recreate the Investie platform from scratch, combining the API-first backend architecture with the TradingView-integrated frontend for a complete investment analysis platform. 🚀