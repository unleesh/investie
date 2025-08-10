import { Injectable, Logger } from '@nestjs/common';
import { AIEvaluationService } from '../ai/ai-evaluation.service';
import { TechnicalAnalysisService } from '../ai/technical-analysis.service';
import { NewsService } from '../news/news.service';
import { StockCardData, StockSymbol } from '../common/types';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    private readonly aiEvaluationService: AIEvaluationService,
    private readonly technicalAnalysisService: TechnicalAnalysisService,
    private readonly newsService: NewsService,
  ) {}

  async getAllStocks(): Promise<StockCardData[]> {
    const targetSymbols: StockSymbol[] = [
      'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN',
      'NVDA', 'META', 'NFLX', 'AVGO', 'AMD'
    ];

    const stockPromises = targetSymbols.map(symbol => this.getStock(symbol));
    const results = await Promise.allSettled(stockPromises);

    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<StockCardData>).value);
  }

  async getStock(symbol: StockSymbol): Promise<StockCardData | null> {
    try {
      // Fetch all data in parallel
      const [stockData, aiEvaluation, technicalData, newsData] = 
        await Promise.allSettled([
          this.getStockData(symbol),
          this.aiEvaluationService.generateEvaluation(symbol),
          this.technicalAnalysisService.getAnalysis(symbol),
          this.newsService.processStockNews(symbol)
        ]);

      // Extract results with fallbacks
      const price = stockData.status === 'fulfilled' ? stockData.value : this.getMockPriceData(symbol);
      const evaluation = aiEvaluation.status === 'fulfilled' ? aiEvaluation.value : this.getMockAIEvaluation(symbol);
      const technicals = technicalData.status === 'fulfilled' ? technicalData.value : this.getMockTechnicals();
      const newsSummary = newsData.status === 'fulfilled' && newsData.value.isValid 
        ? {
            headline: newsData.value.overview?.overview || 'No news available',
            sentiment: this.extractSentimentFromOverview(newsData.value.overview),
            source: newsData.value.overview?.source || 'fallback_data'
          }
        : this.getMockNewsSummary(symbol);

      return this.transformToStockCardData(price, evaluation, technicals, newsSummary, symbol);
    } catch (error) {
      this.logger.error(`Failed to get stock data for ${symbol}: ${error.message}`);
      return null;
    }
  }

  async getStockChart(symbol: StockSymbol, period: string = '1W'): Promise<any> {
    // Mock chart data - in production this would fetch real chart data
    return this.getMockChartData(symbol, period);
  }

  private async getStockData(symbol: StockSymbol): Promise<any> {
    // Mock implementation - in production this would use SerpApi
    return this.getMockStockData(symbol);
  }

  private transformToStockCardData(stockData: any, aiEvaluation: any, technicals: any, newsSummary: any, symbol: StockSymbol): StockCardData {
    return {
      symbol,
      name: this.getCompanyName(symbol),
      price: {
        current: stockData.price || 100,
        change: stockData.change || 0,
        changePercent: stockData.changePercent || 0,
        source: 'google_finance'
      },
      fundamentals: {
        pe: stockData.pe || 20,
        marketCap: stockData.marketCap || 1000000000,
        volume: stockData.volume || 1000000,
        fiftyTwoWeekHigh: stockData.fiftyTwoWeekHigh || 120,
        fiftyTwoWeekLow: stockData.fiftyTwoWeekLow || 80
      },
      aiEvaluation,
      technicals,
      newsSummary,
      sectorPerformance: {
        name: this.getSectorName(symbol),
        weeklyChange: this.getMockSectorChange()
      }
    };
  }

  private extractSentimentFromOverview(overview: any): 'positive' | 'neutral' | 'negative' {
    if (!overview) return 'neutral';
    
    const text = (overview.overview || '').toLowerCase();
    if (text.includes('positive') || text.includes('buy') || text.includes('bullish')) {
      return 'positive';
    }
    if (text.includes('negative') || text.includes('sell') || text.includes('bearish')) {
      return 'negative';
    }
    return 'neutral';
  }

  private getCompanyName(symbol: StockSymbol): string {
    const names: Record<StockSymbol, string> = {
      'AAPL': 'Apple Inc.',
      'TSLA': 'Tesla, Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com, Inc.',
      'NVDA': 'NVIDIA Corporation',
      'META': 'Meta Platforms, Inc.',
      'NFLX': 'Netflix, Inc.',
      'AVGO': 'Broadcom Inc.',
      'AMD': 'Advanced Micro Devices, Inc.'
    };
    return names[symbol] || symbol;
  }

  private getSectorName(symbol: StockSymbol): string {
    const sectors: Record<StockSymbol, string> = {
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
    return sectors[symbol] || 'Technology';
  }

  private getMockSectorChange(): number {
    return (Math.random() - 0.5) * 10; // Random between -5% and 5%
  }

  private getMockPriceData(symbol: StockSymbol) {
    const mockPrices: Record<StockSymbol, number> = {
      'AAPL': 182.52,
      'TSLA': 245.83,
      'MSFT': 378.24,
      'GOOGL': 138.93,
      'AMZN': 146.80,
      'NVDA': 685.32,
      'META': 298.57,
      'NFLX': 456.78,
      'AVGO': 892.13,
      'AMD': 143.29
    };

    const basePrice = mockPrices[symbol] || 100;
    const change = (Math.random() - 0.5) * 10; // Random change between -5 and 5
    const changePercent = (change / basePrice) * 100;

    return {
      price: basePrice + change,
      change,
      changePercent,
      pe: 15 + Math.random() * 20,
      marketCap: Math.random() * 2000000000000,
      volume: Math.random() * 50000000,
      fiftyTwoWeekHigh: basePrice * 1.2,
      fiftyTwoWeekLow: basePrice * 0.8
    };
  }

  private getMockStockData(symbol: StockSymbol) {
    return this.getMockPriceData(symbol);
  }

  private getMockAIEvaluation(symbol: StockSymbol) {
    return {
      rating: 'hold' as const,
      confidence: 70,
      summary: `Mock evaluation for ${symbol}. Please configure API keys for real analysis.`,
      keyFactors: ['Mock data', 'API configuration needed', 'Real-time analysis pending'],
      timeframe: '3M' as const,
      source: 'claude_ai' as const,
      lastUpdated: new Date().toISOString()
    };
  }

  private getMockTechnicals() {
    return {
      rsi: 50 + Math.random() * 30,
      sma20: 100 + Math.random() * 50,
      sma50: 100 + Math.random() * 50,
      volume: Math.random() * 50000000,
      signals: {
        trend: 'neutral' as const,
        strength: 'moderate' as const
      }
    };
  }

  private getMockNewsSummary(symbol: StockSymbol) {
    return {
      headline: `Latest ${symbol} market updates and analysis`,
      sentiment: 'neutral' as const,
      source: 'mock_data'
    };
  }

  private getMockChartData(symbol: StockSymbol, period: string) {
    const basePrice = 100;
    const dataPoints = period === '1W' ? 7 : period === '1M' ? 30 : 365;
    const data: any[] = [];

    for (let i = 0; i < dataPoints; i++) {
      data.push({
        time: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000).toISOString(),
        open: basePrice + Math.random() * 10,
        high: basePrice + Math.random() * 15,
        low: basePrice - Math.random() * 10,
        close: basePrice + Math.random() * 10,
        volume: Math.random() * 1000000
      });
    }

    return {
      symbol,
      period,
      data,
      source: 'mock_data'
    };
  }
}