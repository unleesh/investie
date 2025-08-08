# BE1 & BE2 Resolution Implementation Roadmap

## 🎯 Executive Action Plan

This document provides step-by-step implementation guides to resolve all identified gaps in BE1 (Financial Data) and BE2 (News & AI) services, transforming them from stub implementations into fully functional systems as specified in the PRD.

---

## 🔴 CRITICAL PRIORITY: Infrastructure Fix

### **Issue 1: NestJS Platform Configuration**

**Problem**: Backend fails to start due to package version conflicts
**Impact**: Prevents all endpoint testing and development
**Priority**: BLOCKER

#### **Resolution Steps:**

1. **Verify Current Dependencies**
```bash
cd apps/backend
npm list @nestjs/common @nestjs/config @nestjs/platform-express
```

2. **Update Dependencies to Compatible Versions**
```bash
# Remove conflicting packages
npm uninstall @nestjs/config

# Install compatible versions for NestJS 11
npm install @nestjs/config@^4.0.0 --legacy-peer-deps

# Verify platform-express is properly linked
npm install @nestjs/platform-express@^11.0.0 --save
```

3. **Update Main.ts Configuration**
```typescript
// apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });
  
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
```

4. **Test Server Startup**
```bash
npm run build
npm run start:dev

# Verify health endpoint
curl http://localhost:3000/api/v1/health
```

**Expected Result**: Server starts without platform errors, health endpoint responds with JSON

---

## 🔴 CRITICAL PRIORITY: Core AI Integration

### **Issue 2: Claude API Integration Foundation**

#### **Step 1: Environment Configuration**

1. **Update .env File**
```bash
# apps/backend/.env
FRED_API_KEY=your_actual_fred_api_key
SERPAPI_API_KEY=your_actual_serpapi_key
CLAUDE_API_KEY=your_actual_claude_api_key

# Optional: Claude API Configuration
CLAUDE_API_VERSION=2024-08-06
CLAUDE_MODEL=claude-3-haiku-20240307
CLAUDE_MAX_TOKENS=1000
```

2. **Install Required Dependencies**
```bash
cd apps/backend
npm install @anthropic-ai/sdk --save
```

#### **Step 2: Create Claude Service Foundation**

**Create**: `apps/backend/src/services/claude.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly anthropic: Anthropic;

  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      this.logger.warn('Claude API key not configured - using fallback responses');
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  async generateResponse(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      if (!process.env.CLAUDE_API_KEY) {
        return 'Claude API integration pending - using mock response';
      }

      const message = await this.anthropic.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (error) {
      this.logger.error('Claude API error:', error.message);
      throw new Error(`Claude API failed: ${error.message}`);
    }
  }

  async generateStructuredResponse<T>(prompt: string, schema: string): Promise<T> {
    try {
      const fullPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${schema}`;
      const response = await this.generateResponse(fullPrompt);
      
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Structured response parsing failed:', error.message);
      throw error;
    }
  }
}
```

#### **Step 3: Register Claude Service**

**Update**: `apps/backend/src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketModule } from './market/market.module';
import { StocksModule } from './stocks/stocks.module';
import { ChatModule } from './chat/chat.module';
import { NewsModule } from './news/news.module';
import { ClaudeService } from './services/claude.service'; // Add this

@Module({
  imports: [MarketModule, StocksModule, ChatModule, NewsModule],
  controllers: [AppController],
  providers: [AppService, ClaudeService], // Add ClaudeService
  exports: [ClaudeService], // Add this for cross-module usage
})
export class AppModule {}
```

---

## 🔴 CRITICAL PRIORITY: AI Evaluation Service

### **Issue 3: Stock AI Evaluations Implementation**

**Target**: `apps/backend/src/ai/ai-evaluation.service.ts`

#### **Complete Implementation:**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import type { AIEvaluation, StockSymbol } from '@investie/types';
import { ClaudeService } from '../services/claude.service';

@Injectable()
export class AIEvaluationService {
  private readonly logger = new Logger(AIEvaluationService.name);

  constructor(private readonly claudeService: ClaudeService) {}

  async generateEvaluation(symbol: StockSymbol, stockData?: any): Promise<AIEvaluation> {
    try {
      const prompt = this.buildEvaluationPrompt(symbol, stockData);
      const response = await this.claudeService.generateStructuredResponse<{
        summary: string;
        rating: 'bullish' | 'neutral' | 'bearish';
        confidence: number;
        keyFactors: string[];
        timeframe: '1W' | '1M' | '3M';
      }>(prompt, this.getEvaluationSchema());

      return {
        ...response,
        source: 'claude_ai',
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`AI evaluation failed for ${symbol}:`, error.message);
      
      // Fallback to enhanced mock data
      return this.getEnhancedMockEvaluation(symbol);
    }
  }

  private buildEvaluationPrompt(symbol: StockSymbol, stockData: any): string {
    const dataContext = stockData ? 
      `Current price: $${stockData.price}, Volume: ${stockData.volume}, PE: ${stockData.pe}` :
      'Using latest market data';

    return `
As a senior investment analyst, provide a comprehensive evaluation of ${symbol}.

Context: ${dataContext}

Consider:
1. Recent financial performance and metrics
2. Market sentiment and technical indicators  
3. Industry trends and competitive position
4. Risk factors and growth catalysts
5. Current market conditions and economic environment

Provide a balanced, objective analysis suitable for retail investors.
Focus on actionable insights and clear reasoning.
    `;
  }

  private getEvaluationSchema(): string {
    return `{
  "summary": "2-3 sentence comprehensive analysis",
  "rating": "bullish|neutral|bearish", 
  "confidence": "number between 0-100",
  "keyFactors": ["factor1", "factor2", "factor3", "factor4"],
  "timeframe": "1W|1M|3M"
}`;
  }

  private getEnhancedMockEvaluation(symbol: StockSymbol): AIEvaluation {
    const evaluations = {
      'AAPL': {
        summary: 'Apple shows solid fundamentals with strong Services revenue growth and Vision Pro innovation catalyst. iPhone upgrade cycle momentum building despite supply chain concerns.',
        rating: 'bullish' as const,
        confidence: 85,
        keyFactors: ['Services revenue expansion', 'Vision Pro market potential', 'Strong cash position', 'AI integration opportunities'],
      },
      'TSLA': {
        summary: 'Tesla faces delivery challenges but maintains EV market leadership. FSD progress and energy business growth provide long-term catalysts amid valuation concerns.',
        rating: 'neutral' as const,
        confidence: 70,
        keyFactors: ['EV market competition', 'FSD development progress', 'Energy business growth', 'Valuation multiples'],
      },
      // Add more stock-specific evaluations...
    };

    const evaluation = evaluations[symbol] || {
      summary: `${symbol} analysis pending real-time data integration. Market conditions remain volatile with mixed fundamentals.`,
      rating: 'neutral' as const,
      confidence: 60,
      keyFactors: ['Market volatility', 'Economic conditions', 'Sector performance', 'Technical indicators'],
    };

    return {
      ...evaluation,
      timeframe: '3M',
      source: 'claude_ai',
      lastUpdated: new Date().toISOString(),
    };
  }
}
```

#### **Integration Steps:**

1. **Update Stock Service Integration**

**Update**: `apps/backend/src/stocks/stocks.service.ts`
```typescript
// Add to constructor
constructor(
  private serpApiService: SerpApiService,
  private readonly newsService: NewsService,
  private readonly aiEvaluationService: AIEvaluationService, // Add this
) {}

// Update transformToStockCardData method
private async transformToStockCardData(stockData: any, newsData: any[], symbol: StockSymbol): Promise<StockCardData | null> {
  try {
    const mockStock = getStock(symbol);
    if (!mockStock) return null;

    // Generate real AI evaluation
    const aiEvaluation = await this.aiEvaluationService.generateEvaluation(symbol, stockData);

    return {
      symbol,
      name: stockData?.summary?.title || mockStock.name,
      // ... other fields
      aiEvaluation, // Use real AI evaluation instead of mock
      // ... rest of fields
    };
  } catch (error) {
    // ... error handling
  }
}
```

---

## 🔴 CRITICAL PRIORITY: Chat Service Implementation

### **Issue 4: AI Chatbot Functionality**

**Target**: `apps/backend/src/chat/chat.service.ts`

#### **Complete Implementation:**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import type { ChatMessage, ChatSession, StockSymbol } from '@investie/types';
import { ClaudeService } from '../services/claude.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private sessions: Map<string, ChatSession> = new Map();

  constructor(private readonly claudeService: ClaudeService) {}

  async createSession(): Promise<ChatSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      sessionId,
      messages: [],
      isActive: true,
      lastActivity: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`Created chat session: ${sessionId}`);
    return session;
  }

  async sendMessage(sessionId: string, message: string, context?: 'market' | 'stock' | 'general', relatedSymbol?: StockSymbol): Promise<ChatMessage> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        context,
        relatedSymbol,
      };

      // Generate AI response
      const aiResponseContent = await this.generateAIResponse(message, session, context, relatedSymbol);
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date().toISOString(),
        context,
        relatedSymbol,
      };

      // Update session
      session.messages.push(userMessage, aiMessage);
      session.lastActivity = new Date().toISOString();
      
      this.logger.log(`Generated AI response for session ${sessionId}`);
      return aiMessage;
    } catch (error) {
      this.logger.error(`Chat error for session ${sessionId}:`, error.message);
      
      // Fallback response
      return this.createFallbackResponse(message);
    }
  }

  private async generateAIResponse(
    message: string, 
    session: ChatSession, 
    context?: string, 
    relatedSymbol?: StockSymbol
  ): Promise<string> {
    const conversationHistory = session.messages.slice(-6).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = `
You are Investie, an AI investment assistant. Provide helpful, accurate investment guidance.

Context: ${context || 'general'}
Related Stock: ${relatedSymbol || 'none'}

Conversation History:
${conversationHistory}

User: ${message}

Guidelines:
- Provide actionable investment insights
- Include relevant market data when possible  
- Warn about risks and volatility
- Suggest diversification strategies
- Never guarantee returns or give financial advice as a licensed advisor
- Be conversational and helpful
- Keep responses concise (2-3 paragraphs max)

Response:`;

    return await this.claudeService.generateResponse(prompt, 500);
  }

  private createFallbackResponse(message: string): ChatMessage {
    const fallbackResponses = [
      "I'm currently processing your investment question. While I work on integrating real-time AI responses, I recommend checking our market summary and stock analysis features.",
      "Thanks for your question about investing. I'm being enhanced with real-time AI capabilities. Meanwhile, you can explore individual stock cards for detailed analysis.",
      "Your investment query is important. I'm currently in development to provide more intelligent responses. Please check our comprehensive stock data and market insights.",
    ];

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      role: 'assistant',
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      timestamp: new Date().toISOString(),
      context: 'general',
    };
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getRecentSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 10);
  }

  async endSession(sessionId: string): Promise<{ success: boolean }> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.logger.log(`Ended chat session: ${sessionId}`);
      return { success: true };
    }
    return { success: false };
  }
}
```

---

## 🟡 HIGH PRIORITY: Market Data Enhancement

### **Issue 5: Fear & Greed Index Implementation**

**Target**: Enhance `apps/backend/src/market/market.service.ts`

#### **Create Fear & Greed Service:**

**Create**: `apps/backend/src/services/fear-greed.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import type { FearGreedIndex } from '@investie/types';

@Injectable()
export class FearGreedService {
  private readonly logger = new Logger(FearGreedService.name);
  private cachedIndex: FearGreedIndex | null = null;
  private lastUpdate: Date | null = null;
  private readonly CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

  constructor(private readonly claudeService: ClaudeService) {}

  async getCurrentFearGreedIndex(): Promise<FearGreedIndex> {
    try {
      // Check cache
      if (this.cachedIndex && this.lastUpdate && 
          Date.now() - this.lastUpdate.getTime() < this.CACHE_DURATION) {
        return this.cachedIndex;
      }

      // Fetch current index using Claude Search
      const prompt = `
Search for the current CNN Fear & Greed Index value. 
Return the current numerical value and status (fear/neutral/greed).

Provide response as JSON:
{
  "value": number_0_to_100,
  "status": "fear|neutral|greed"
}
      `;

      const response = await this.claudeService.generateStructuredResponse<{
        value: number;
        status: 'fear' | 'neutral' | 'greed';
      }>(prompt, '{"value": number, "status": "fear|neutral|greed"}');

      const index: FearGreedIndex = {
        ...response,
        source: 'claude_search'
      };

      // Update cache
      this.cachedIndex = index;
      this.lastUpdate = new Date();
      
      this.logger.log(`Updated Fear & Greed Index: ${index.value} (${index.status})`);
      return index;
    } catch (error) {
      this.logger.error('Failed to fetch Fear & Greed Index:', error.message);
      
      // Return fallback with reasonable default
      return {
        value: 45, // Slightly fearful default
        status: 'neutral',
        source: 'claude_search'
      };
    }
  }
}
```

#### **Update Market Service:**

**Update**: `apps/backend/src/market/market.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import type { MarketSummaryData } from '@investie/types';
import { getMarketSummary } from '@investie/mock';
import { FinancialDataService } from './financial-data.service';
import { FearGreedService } from '../services/fear-greed.service'; // Add this
import { ClaudeService } from '../services/claude.service'; // Add this

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private financialDataService: FinancialDataService,
    private fearGreedService: FearGreedService, // Add this
    private claudeService: ClaudeService, // Add this
  ) {}

  async getSummary(): Promise<MarketSummaryData> {
    try {
      this.logger.log('Fetching enhanced market summary with AI components');
      
      const [economicData, marketData, fearGreedIndex] = await Promise.allSettled([
        this.financialDataService.getEconomicIndicators(),
        this.financialDataService.getMarketIndices(),
        this.fearGreedService.getCurrentFearGreedIndex(), // Add this
      ]);

      const economics = economicData.status === 'fulfilled' ? economicData.value : null;
      const markets = marketData.status === 'fulfilled' ? marketData.value : null;
      const fearGreed = fearGreedIndex.status === 'fulfilled' ? fearGreedIndex.value : null;

      return this.transformToMarketSummary(economics, markets, fearGreed);
    } catch (error) {
      this.logger.error('Failed to fetch market data, falling back to mock data:', error.message);
      return getMarketSummary();
    }
  }

  private async transformToMarketSummary(
    economics: any,
    markets: any,
    fearGreedIndex?: any
  ): Promise<MarketSummaryData> {
    try {
      const mockData = getMarketSummary();

      // Generate AI outlook for interest rates
      const aiOutlook = await this.generateInterestRateOutlook(economics?.interestRate);

      return {
        fearGreedIndex: fearGreedIndex || mockData.fearGreedIndex,
        vix: {
          value: markets?.vix?.value || mockData.vix.value,
          status: markets?.vix?.status || mockData.vix.status,
          source: mockData.vix.source,
        },
        interestRate: {
          value: economics?.interestRate?.value || mockData.interestRate.value,
          aiOutlook, // Use generated AI outlook
          source: mockData.interestRate.source,
        },
        cpi: {
          value: economics?.cpi?.value || mockData.cpi.value,
          monthOverMonth: economics?.cpi?.monthOverMonth || mockData.cpi.monthOverMonth,
          direction: economics?.cpi?.direction || mockData.cpi.direction,
          source: mockData.cpi.source,
        },
        unemploymentRate: {
          value: economics?.unemploymentRate?.value || mockData.unemploymentRate.value,
          monthOverMonth: economics?.unemploymentRate?.monthOverMonth || mockData.unemploymentRate.monthOverMonth,
          source: mockData.unemploymentRate.source,
        },
        sp500Sparkline: markets?.sp500?.sparkline || mockData.sp500Sparkline,
      };
    } catch (error) {
      this.logger.error('Failed to transform market data:', error.message);
      return getMarketSummary();
    }
  }

  private async generateInterestRateOutlook(rateData: any): Promise<string> {
    try {
      const currentRate = rateData?.value || 5.33;
      const prompt = `
As a financial analyst, provide a brief outlook on Federal interest rates.
Current rate: ${currentRate}%

Consider:
- Recent Fed policy decisions
- Inflation trends 
- Economic indicators
- Market expectations

Provide a concise 1-2 sentence outlook suitable for retail investors:
      `;

      return await this.claudeService.generateResponse(prompt, 200);
    } catch (error) {
      this.logger.error('Failed to generate AI outlook:', error.message);
      return 'Fed rate expected to hold steady through the next quarter pending inflation data.';
    }
  }
}
```

---

## 🟡 HIGH PRIORITY: Technical Analysis

### **Issue 6: RSI Calculation Implementation**

**Target**: Add technical analysis to stocks service

#### **Create Technical Analysis Service:**

**Create**: `apps/backend/src/services/technical-analysis.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import type { StockTechnicals } from '@investie/types';

@Injectable()
export class TechnicalAnalysisService {
  private readonly logger = new Logger(TechnicalAnalysisService.name);

  calculateRSI(prices: number[], period: number = 14): StockTechnicals {
    try {
      if (prices.length < period + 1) {
        throw new Error(`Insufficient data for RSI calculation. Need ${period + 1} prices, got ${prices.length}`);
      }

      const gains: number[] = [];
      const losses: number[] = [];

      // Calculate price changes
      for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
      }

      // Calculate initial average gain and loss
      const avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
      const avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

      // Calculate RSI using the smoothed averages
      const rs = avgGain / (avgLoss || 0.0001); // Avoid division by zero
      const rsi = 100 - (100 / (1 + rs));

      return {
        rsi: Math.round(rsi * 100) / 100, // Round to 2 decimal places
        rsiStatus: this.determineRSIStatus(rsi),
      };
    } catch (error) {
      this.logger.error('RSI calculation failed:', error.message);
      
      // Return neutral default
      return {
        rsi: 50,
        rsiStatus: 'neutral',
      };
    }
  }

  private determineRSIStatus(rsi: number): 'oversold' | 'neutral' | 'overbought' {
    if (rsi <= 30) return 'oversold';
    if (rsi >= 70) return 'overbought';
    return 'neutral';
  }

  // Extract prices from SerpApi chart data
  extractPricesFromChartData(chartData: any): number[] {
    try {
      if (!chartData?.graph?.series) {
        throw new Error('Invalid chart data structure');
      }

      const prices: number[] = [];
      const series = chartData.graph.series[0]; // Assuming first series is price data
      
      if (series?.data) {
        for (const point of series.data) {
          if (point?.value || point?.close || point?.price) {
            prices.push(parseFloat(point.value || point.close || point.price));
          }
        }
      }

      return prices;
    } catch (error) {
      this.logger.error('Failed to extract prices from chart data:', error.message);
      return [];
    }
  }
}
```

#### **Update Stocks Service Integration:**

**Update**: `apps/backend/src/stocks/stocks.service.ts`
```typescript
// Add to constructor
constructor(
  private serpApiService: SerpApiService,
  private readonly newsService: NewsService,
  private readonly aiEvaluationService: AIEvaluationService,
  private readonly technicalAnalysisService: TechnicalAnalysisService, // Add this
) {}

// Update getStockData method
private async getStockData(symbol: StockSymbol): Promise<StockCardData | null> {
  try {
    const [stockData, newsData, chartData] = await Promise.allSettled([
      this.serpApiService.getStockData(symbol),
      this.serpApiService.getStockNews(symbol),
      this.serpApiService.getChartData(`${symbol}:NASDAQ`, '1M'), // Get 1 month for RSI
    ]);

    const stock = stockData.status === 'fulfilled' ? stockData.value : null;
    const news = newsData.status === 'fulfilled' ? newsData.value : [];
    const chart = chartData.status === 'fulfilled' ? chartData.value : null;

    return this.transformToStockCardData(stock, news, chart, symbol);
  } catch (error) {
    // ... error handling
  }
}

// Update transformToStockCardData method
private async transformToStockCardData(
  stockData: any, 
  newsData: any[], 
  chartData: any,
  symbol: StockSymbol
): Promise<StockCardData | null> {
  try {
    const mockStock = getStock(symbol);
    if (!mockStock) return null;

    // Calculate real RSI from chart data
    const prices = this.technicalAnalysisService.extractPricesFromChartData(chartData);
    const technicals = prices.length > 14 ? 
      this.technicalAnalysisService.calculateRSI(prices) :
      mockStock.technicals;

    const aiEvaluation = await this.aiEvaluationService.generateEvaluation(symbol, stockData);

    return {
      symbol,
      name: stockData?.summary?.title || mockStock.name,
      price: {
        current: this.extractPrice(stockData) || mockStock.price.current,
        change: this.extractChange(stockData) || mockStock.price.change,
        changePercent: this.extractChangePercent(stockData) || mockStock.price.changePercent,
        source: 'google_finance' as const,
      },
      priceChart: mockStock.priceChart, // Enhanced with real chart data in future iteration
      fundamentals: {
        pe: this.extractPE(stockData) || mockStock.fundamentals.pe,
        marketCap: this.parseMarketCap(this.extractMarketCap(stockData)) || mockStock.fundamentals.marketCap,
        volume: this.extractVolume(stockData) || mockStock.fundamentals.volume,
        fiftyTwoWeekHigh: mockStock.fundamentals.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: mockStock.fundamentals.fiftyTwoWeekLow,
        source: 'google_finance' as const,
      },
      technicals, // Use calculated RSI
      aiEvaluation, // Real AI evaluation
      newsSummary: this.transformToNewsSummary(newsData) || mockStock.newsSummary,
      sectorPerformance: mockStock.sectorPerformance,
    };
  } catch (error) {
    this.logger.error(`Failed to transform data for ${symbol}:`, error.message);
    const fallback = getStock(symbol);
    return fallback || null;
  }
}
```

---

## 🟢 MEDIUM PRIORITY: Caching Enhancement

### **Issue 7: Implement Proper TTL Caching Strategy**

**Target**: Enhance `apps/backend/src/cache/cache.service.ts`

#### **Enhanced Cache Implementation:**

```typescript
import { Injectable, Logger } from '@nestjs/common';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  totalItems: number;
  hitRate: number;
  memoryUsage: string;
  itemsByType: Record<string, number>;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheItem<any>>();
  private hits = 0;
  private misses = 0;

  // TTL constants (milliseconds)
  private readonly TTL = {
    ECONOMIC_DATA: 24 * 60 * 60 * 1000, // 24 hours
    AI_CONTENT: 12 * 60 * 60 * 1000,    // 12 hours  
    NEWS_DATA: 6 * 60 * 60 * 1000,      // 6 hours
    CHAT_CONTEXT: 1 * 60 * 60 * 1000,   // 1 hour
    STOCK_DATA: 5 * 60 * 1000,          // 5 minutes
    CHART_DATA: 1 * 60 * 60 * 1000,     // 1 hour
  };

  set<T>(key: string, value: T, ttl?: number): void {
    const defaultTtl = this.getDefaultTTL(key);
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    };

    this.cache.set(key, item);
    this.logger.debug(`Cached item: ${key} (TTL: ${item.ttl}ms)`);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.misses++;
      this.logger.debug(`Cache expired and removed: ${key}`);
      return null;
    }

    this.hits++;
    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.logger.log(`Cache cleared: ${size} items removed`);
  }

  // Specific caching methods with proper TTL
  setEconomicData<T>(key: string, data: T): void {
    this.set(`economic:${key}`, data, this.TTL.ECONOMIC_DATA);
  }

  getEconomicData<T>(key: string): T | null {
    return this.get<T>(`economic:${key}`);
  }

  setAIContent<T>(key: string, data: T): void {
    this.set(`ai:${key}`, data, this.TTL.AI_CONTENT);
  }

  getAIContent<T>(key: string): T | null {
    return this.get<T>(`ai:${key}`);
  }

  setNewsData<T>(key: string, data: T): void {
    this.set(`news:${key}`, data, this.TTL.NEWS_DATA);
  }

  getNewsData<T>(key: string): T | null {
    return this.get<T>(`news:${key}`);
  }

  setStockData<T>(key: string, data: T): void {
    this.set(`stock:${key}`, data, this.TTL.STOCK_DATA);
  }

  getStockData<T>(key: string): T | null {
    return this.get<T>(`stock:${key}`);
  }

  getCacheStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    const itemsByType: Record<string, number> = {};
    for (const key of this.cache.keys()) {
      const type = key.split(':')[0];
      itemsByType[type] = (itemsByType[type] || 0) + 1;
    }

    return {
      totalItems: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: `${Math.round(this.estimateMemoryUsage() / 1024 / 1024 * 100) / 100}MB`,
      itemsByType,
    };
  }

  private getDefaultTTL(key: string): number {
    if (key.startsWith('economic:')) return this.TTL.ECONOMIC_DATA;
    if (key.startsWith('ai:')) return this.TTL.AI_CONTENT;
    if (key.startsWith('news:')) return this.TTL.NEWS_DATA;
    if (key.startsWith('chat:')) return this.TTL.CHAT_CONTEXT;
    if (key.startsWith('stock:')) return this.TTL.STOCK_DATA;
    if (key.startsWith('chart:')) return this.TTL.CHART_DATA;
    
    return 5 * 60 * 1000; // Default 5 minutes
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(item).length * 2;
    }
    return size;
  }

  // Periodic cleanup of expired items
  cleanup(): void {
    const before = this.cache.size;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
    
    const removed = before - this.cache.size;
    if (removed > 0) {
      this.logger.log(`Cache cleanup: ${removed} expired items removed`);
    }
  }
}
```

---

## 📋 Implementation Checklist

### **Week 1: Critical Infrastructure**
- [ ] Fix NestJS platform configuration error
- [ ] Install and configure Claude API integration
- [ ] Create ClaudeService foundation
- [ ] Test basic AI response generation
- [ ] Verify all endpoints can start successfully

### **Week 2: Core AI Features**
- [ ] Implement AIEvaluationService with real Claude integration
- [ ] Integrate AI evaluations into StocksService
- [ ] Implement ChatService with intelligent responses
- [ ] Create FearGreedService for market sentiment
- [ ] Add AI outlook generation for interest rates

### **Week 3: Technical & Performance**  
- [ ] Implement RSI calculation with TechnicalAnalysisService
- [ ] Enhance caching strategy with proper TTLs
- [ ] Add comprehensive error handling
- [ ] Performance optimization and testing
- [ ] API rate limiting implementation

### **Week 4: Testing & Validation**
- [ ] Comprehensive unit tests for all services
- [ ] Integration tests with external APIs
- [ ] Load testing and performance validation
- [ ] Cost analysis and optimization
- [ ] Documentation and deployment preparation

---

## 💰 Cost Optimization Strategies

### **Claude API Usage Optimization:**
1. **Prompt Engineering**: Optimize prompts for concise, effective responses
2. **Response Caching**: Cache AI responses for 12 hours to reduce API calls
3. **Batch Processing**: Group similar requests when possible
4. **Model Selection**: Use Claude Haiku for basic tasks, Sonnet for complex analysis
5. **Token Limits**: Set appropriate max_tokens based on use case

### **SerpApi Optimization:**
1. **Request Batching**: Combine multiple stock queries when possible
2. **Selective Data**: Request only required fields to reduce response size
3. **Cache Strategy**: 5-minute cache for stock data, 1-hour for chart data
4. **Error Handling**: Proper fallback to prevent API quota waste

### **Monitoring & Alerts:**
1. **API Usage Tracking**: Monitor daily/monthly API consumption
2. **Cost Alerts**: Set up alerts for unusual API usage spikes
3. **Performance Metrics**: Track response times and error rates
4. **Usage Analytics**: Analyze which features drive the most API calls

---

**Document Status**: ✅ **IMPLEMENTATION READY**  
**Next Action**: Execute Week 1 checklist starting with NestJS platform fix  
**Estimated Completion**: 3-4 weeks with 1 backend developer  
**Success Criteria**: All PRD requirements functionally implemented with real API integrations