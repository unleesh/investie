import { Injectable, Logger } from '@nestjs/common';
import type { StockCardData, StockSymbol } from '@investie/types';
import { getAllStocks, getStock } from '@investie/mock';
import { SerpApiService } from '../services/serpapi.service';
import { NewsService } from '../news/news.service';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    private serpApiService: SerpApiService,
    private readonly newsService: NewsService
  ) {}

  async getAllStocks(): Promise<StockCardData[]> {
    const symbols: StockSymbol[] = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'AVGO', 'AMD'];
    
    try {
      this.logger.log('Fetching all stocks data from APIs');
      
      const stockPromises = symbols.map(symbol => this.getStockData(symbol));
      const results = await Promise.allSettled(stockPromises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<StockCardData> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
    } catch (error) {
      this.logger.error('Failed to fetch all stocks, using mock data:', error.message);
      return getAllStocks();
    }
  }

  async getStock(symbol: StockSymbol): Promise<StockCardData | null> {
    try {
      return await this.getStockData(symbol);
    } catch (error) {
      this.logger.error(`Failed to fetch ${symbol}, using mock data:`, error.message);
      const fallback = getStock(symbol);
      return fallback || null;
    }
  }

  async getStockChart(symbol: StockSymbol, period: string = '1W'): Promise<any> {
    try {
      this.logger.log(`Fetching chart data for ${symbol} (${period})`);
      return await this.serpApiService.getChartData(`${symbol}:NASDAQ`, period);
    } catch (error) {
      this.logger.error(`Failed to fetch chart for ${symbol}:`, error.message);
      return null;
    }
  }

  getStockSync(symbol: StockSymbol): StockCardData | null {
    // Synchronous version for backward compatibility
    const stock = getStock(symbol);
    return stock || null;
  }

  private async getStockData(symbol: StockSymbol): Promise<StockCardData | null> {
    try {
      const [stockData, newsData] = await Promise.allSettled([
        this.serpApiService.getStockData(symbol),
        this.serpApiService.getStockNews(symbol),
      ]);

      const stock = stockData.status === 'fulfilled' ? stockData.value : null;
      const news = newsData.status === 'fulfilled' ? newsData.value : [];

      return this.transformToStockCardData(stock, news, symbol);
    } catch (error) {
      this.logger.error(`Failed to fetch data for ${symbol}:`, error.message);
      const fallback = getStock(symbol);
      return fallback || null;
    }
  }

  private transformToStockCardData(stockData: any, newsData: any[], symbol: StockSymbol): StockCardData | null {
    try {
      // Get mock data as fallback template
      const mockStock = getStock(symbol);
      if (!mockStock) {
        this.logger.error(`No mock data available for ${symbol}`);
        return null;
      }

      return {
        symbol,
        name: stockData?.summary?.title || mockStock.name,
        price: {
          current: this.extractPrice(stockData) || mockStock.price.current,
          change: this.extractChange(stockData) || mockStock.price.change,
          changePercent: this.extractChangePercent(stockData) || mockStock.price.changePercent,
          source: 'google_finance' as const,
        },
        priceChart: mockStock.priceChart,
        fundamentals: {
          pe: this.extractPE(stockData) || mockStock.fundamentals.pe,
          marketCap: this.parseMarketCap(this.extractMarketCap(stockData)) || mockStock.fundamentals.marketCap,
          volume: this.extractVolume(stockData) || mockStock.fundamentals.volume,
          fiftyTwoWeekHigh: mockStock.fundamentals.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: mockStock.fundamentals.fiftyTwoWeekLow,
          source: 'google_finance' as const,
        },
        technicals: {
          rsi: mockStock.technicals.rsi,
          rsiStatus: mockStock.technicals.rsiStatus,
        },
        aiEvaluation: mockStock.aiEvaluation,
        newsSummary: this.transformToNewsSummary(newsData) || mockStock.newsSummary,
        sectorPerformance: mockStock.sectorPerformance,
      };
    } catch (error) {
      this.logger.error(`Failed to transform data for ${symbol}:`, error.message);
      const fallback = getStock(symbol);
      return fallback || null;
    }
  }

  private extractPrice(data: any): number | null {
    try {
      return data?.summary?.price?.value || data?.price || null;
    } catch {
      return null;
    }
  }

  private extractChange(data: any): number | null {
    try {
      return data?.summary?.price?.change || data?.change || null;
    } catch {
      return null;
    }
  }

  private extractChangePercent(data: any): number | null {
    try {
      return data?.summary?.price?.change_percent || data?.change_percent || null;
    } catch {
      return null;
    }
  }

  private extractMarketCap(data: any): string | null {
    try {
      return data?.summary?.market_cap || data?.market_cap || null;
    } catch {
      return null;
    }
  }

  private extractPE(data: any): number | null {
    try {
      return data?.summary?.pe_ratio || data?.pe_ratio || null;
    } catch {
      return null;
    }
  }

  private extractVolume(data: any): number | null {
    try {
      return data?.summary?.volume || data?.volume || null;
    } catch {
      return null;
    }
  }

  private parseMarketCap(marketCapString: string | null): number | null {
    if (!marketCapString) return null;
    
    try {
      // Parse strings like "2.5T", "150B", "5.2M" to numbers
      const numStr = marketCapString.replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      if (isNaN(num)) return null;
      
      if (marketCapString.includes('T')) return num * 1000000000000;
      if (marketCapString.includes('B')) return num * 1000000000;
      if (marketCapString.includes('M')) return num * 1000000;
      return num;
    } catch {
      return null;
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
}
