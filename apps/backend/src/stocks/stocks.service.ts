import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import type { StockCardData, StockSymbol } from '../types';
import { SerpApiService } from '../services/serpapi.service';
import { NewsService } from '../news/news.service';
import { ClaudeService } from '../services/claude.service';
import { TechnicalAnalysisService } from '../services/technical-analysis.service';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    private serpApiService: SerpApiService,
    private readonly newsService: NewsService,
    private readonly claudeService: ClaudeService,
    private readonly technicalService: TechnicalAnalysisService
  ) {}

  async getAllStocks(): Promise<StockCardData[]> {
    const symbols: StockSymbol[] = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'AVGO', 'AMD'];
    
    try {
      this.logger.log('Fetching all stocks data from APIs');
      
      const stockPromises = symbols.map(symbol => this.getStockData(symbol));
      const results = await Promise.allSettled(stockPromises);
      
      const successfulStocks = results
        .filter((result): result is PromiseFulfilledResult<StockCardData> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      // With API-first architecture, we should have at least some data
      this.logger.log(`✅ [API-FIRST] Successfully retrieved ${successfulStocks.length}/${symbols.length} stocks`);
      
      // Return whatever we have - partial data is better than no data
      return successfulStocks;
    } catch (error) {
      this.logger.error('❌ [API-FIRST] Failed to fetch stocks:', error.message);
      // In API-first mode, return empty array instead of throwing
      return [];
    }
  }

  async getStock(symbol: StockSymbol): Promise<StockCardData | null> {
    try {
      const stockData = await this.getStockData(symbol);
      this.logger.log(`✅ [API-FIRST] Retrieved data for ${symbol}`);
      return stockData;
    } catch (error) {
      this.logger.error(`❌ [API-FIRST] Failed to fetch ${symbol}:`, error.message);
      return null; // API-first: return null instead of fallback
    }
  }

  async getStockChart(symbol: StockSymbol, period: string = '1W'): Promise<any> {
    try {
      this.logger.log(`[API-FIRST] Fetching chart data for ${symbol} (${period})`);
      // Use TradingView-compatible format: NASDAQ:SYMBOL
      const tradingViewSymbol = `NASDAQ:${symbol}`;
      return await this.serpApiService.getChartData(tradingViewSymbol, period);
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to fetch chart for ${symbol}:`, error.message);
      return null;
    }
  }

  getStockSync(symbol: StockSymbol): StockCardData | null {
    // Synchronous version deprecated - use async getStock() instead
    this.logger.warn(`getStockSync is deprecated for ${symbol} - use async getStock() instead`);
    return null;
  }

  private async getStockData(symbol: StockSymbol): Promise<StockCardData | null> {
    try {
      this.logger.log(`[API-FIRST] Fetching comprehensive data for ${symbol}`);
      
      // Use TradingView-compatible format for API calls
      const tradingViewSymbol = `NASDAQ:${symbol}`;
      
      const [stockData, newsData, aiEvaluation, technicalData] = await Promise.allSettled([
        this.serpApiService.getStockData(symbol, 'NASDAQ'),
        this.serpApiService.getStockNews(symbol),
        this.claudeService.generateStockEvaluation(symbol),
        this.technicalService.getAnalysis(symbol)
      ]);

      const stock = stockData.status === 'fulfilled' ? stockData.value : null;
      const news = newsData.status === 'fulfilled' ? newsData.value : [];
      const aiEval = aiEvaluation.status === 'fulfilled' ? aiEvaluation.value : null;
      const technical = technicalData.status === 'fulfilled' ? technicalData.value : null;

      return this.transformToStockCardData(stock, news, aiEval, technical, symbol);
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to fetch data for ${symbol}:`, error.message);
      throw error; // API-first: throw instead of using fallback
    }
  }

  private transformToStockCardData(stockData: any, newsData: any[], aiEvaluation: any, technicalData: any, symbol: StockSymbol): StockCardData | null {
    try {
      // API-first: require real data
      if (!stockData || !stockData.summary) {
        this.logger.warn(`[API-FIRST] No external data available for ${symbol}`);
        return null;
      }
      
      this.logger.log(`[API-FIRST] Transforming real data for ${symbol} - TradingView compatible format`);

      // Company names mapping
      const companyNames: Record<StockSymbol, string> = {
        'AAPL': 'Apple Inc.',
        'TSLA': 'Tesla Inc.',
        'MSFT': 'Microsoft Corporation',
        'GOOGL': 'Alphabet Inc.',
        'AMZN': 'Amazon.com Inc.',
        'NVDA': 'NVIDIA Corporation',
        'META': 'Meta Platforms Inc.',
        'NFLX': 'Netflix Inc.',
        'AVGO': 'Broadcom Inc.',
        'AMD': 'Advanced Micro Devices Inc.'
      };

      return {
        symbol,
        name: stockData?.summary?.title || companyNames[symbol] || symbol,
        price: {
          current: this.extractPrice(stockData),
          change: this.extractChange(stockData),
          changePercent: this.extractChangePercent(stockData),
          source: 'google_finance' as const,
        },
        priceChart: {
          data: [],
          period: '1W',
          trend: 'flat' as const,
          change: 0,
          changePercent: 0,
          source: 'google_finance' as const
        },
        fundamentals: {
          pe: this.extractPE(stockData),
          marketCap: this.parseMarketCap(this.extractMarketCap(stockData)),
          volume: this.extractVolume(stockData),
          fiftyTwoWeekHigh: this.extract52WeekHigh(stockData),
          fiftyTwoWeekLow: this.extract52WeekLow(stockData),
          source: 'google_finance' as const,
        },
        technicals: {
          rsi: technicalData?.rsi || null,
          rsiStatus: this.getRSIStatus(technicalData?.rsi) || 'neutral' as const,
        },
        aiEvaluation: aiEvaluation ? {
          rating: aiEvaluation.rating || 'neutral' as const,
          confidence: aiEvaluation.confidence || 50,
          summary: aiEvaluation.summary || `AI analysis for ${symbol} based on current market data`,
          keyFactors: aiEvaluation.keyFactors || [],
          timeframe: '1M' as const,
          source: 'claude_ai' as const,
          lastUpdated: new Date().toISOString(),
        } : {
          rating: 'neutral' as const,
          confidence: 50,
          summary: `AI analysis for ${symbol} is temporarily unavailable`,
          keyFactors: [],
          timeframe: '1M' as const,
          source: 'claude_ai' as const,
          lastUpdated: new Date().toISOString(),
        },
        newsSummary: this.transformToNewsSummary(newsData) || {
          headline: 'No recent news available',
          sentiment: 'neutral' as const
        },
        sectorPerformance: {
          name: this.getSectorForSymbol(symbol),
          weeklyChange: this.calculateSectorChange(stockData),
          source: 'google_finance' as const,
        },
      };
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to transform data for ${symbol}:`, error.message);
      return null; // API-first: return null instead of fallback
    }
  }

  private extractPrice(data: any): number {
    try {
      return data?.summary?.price || data?.summary?.price?.value || data?.price || 0;
    } catch {
      return 0;
    }
  }

  private extractChange(data: any): number {
    try {
      return data?.summary?.price_change || data?.summary?.change || data?.change || 0;
    } catch {
      return 0;
    }
  }

  private extractChangePercent(data: any): number {
    try {
      return data?.summary?.price_change_percentage || data?.summary?.change_percent || data?.change_percent || 0;
    } catch {
      return 0;
    }
  }

  private extractMarketCap(data: any): string | null {
    try {
      return data?.summary?.market_cap || data?.market_cap || null;
    } catch {
      return null;
    }
  }

  private extractPE(data: any): number {
    try {
      return data?.summary?.pe_ratio || data?.pe_ratio || 0;
    } catch {
      return 0;
    }
  }

  private extractVolume(data: any): number {
    try {
      return data?.summary?.volume || data?.volume || 0;
    } catch {
      return 0;
    }
  }

  private parseMarketCap(marketCapString: string | null): number {
    if (!marketCapString) return 0;
    
    try {
      // Parse strings like "2.5T", "150B", "5.2M" to numbers
      const numStr = marketCapString.replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      if (isNaN(num)) return 0;
      
      if (marketCapString.includes('T')) return num * 1000000000000;
      if (marketCapString.includes('B')) return num * 1000000000;
      if (marketCapString.includes('M')) return num * 1000000;
      return num;
    } catch {
      return 0;
    }
  }

  private transformToNewsSummary(newsData: any[]): any | null {
    try {
      if (!Array.isArray(newsData) || newsData.length === 0) {
        return null;
      }

      const firstNews = newsData[0];
      return {
        headline: firstNews.title || 'Market Update',
        sentiment: 'neutral' as const,
        source: 'google_news + claude_ai' as const,
      };
    } catch {
      return null;
    }
  }

  private getSectorForSymbol(symbol: StockSymbol): string {
    const sectorMap: Record<StockSymbol, string> = {
      'AAPL': 'Technology',
      'TSLA': 'Automotive',
      'MSFT': 'Technology',
      'GOOGL': 'Technology',
      'AMZN': 'Consumer Discretionary',
      'NVDA': 'Technology',
      'META': 'Technology',
      'NFLX': 'Communication Services',
      'AVGO': 'Technology',
      'AMD': 'Technology'
    };
    return sectorMap[symbol] || 'Technology';
  }

  // New helper methods for API-first architecture
  private extract52WeekHigh(data: any): number {
    try {
      return data?.summary?.['52_week_high'] || data?.['52_week_high'] || 0;
    } catch {
      return 0;
    }
  }

  private extract52WeekLow(data: any): number {
    try {
      return data?.summary?.['52_week_low'] || data?.['52_week_low'] || 0;
    } catch {
      return 0;
    }
  }

  private getRSIStatus(rsi: number | null): 'overbought' | 'oversold' | 'neutral' {
    if (!rsi) return 'neutral';
    if (rsi > 70) return 'overbought';
    if (rsi < 30) return 'oversold';
    return 'neutral';
  }

  private calculateSectorChange(data: any): number {
    try {
      // Use the stock's change as a proxy for sector performance
      return this.extractChangePercent(data) || 0;
    } catch {
      return 0;
    }
  }
}
