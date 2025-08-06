import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { FredService } from '../services/fred.service';
import { SerpApiService } from '../services/serpapi.service';

interface EconomicIndicators {
  cpi: {
    value: number;
    monthOverMonth: number;
    direction: 'up' | 'down' | 'stable';
  };
  interestRate: {
    value: number;
  };
  unemploymentRate: {
    value: number;
    monthOverMonth: number;
  };
}

interface MarketIndices {
  sp500: {
    value: number;
    change: number;
    changePercent: number;
    sparkline: Array<{ date: string; value: number }>;
  };
  vix: {
    value: number;
    status: 'Low' | 'Moderate' | 'High' | 'Extreme';
  };
}

@Injectable()
export class FinancialDataService {
  private readonly logger = new Logger(FinancialDataService.name);
  private readonly economicDataTtl: number;
  private readonly stockDataTtl: number;

  constructor(
    private cacheService: CacheService,
    private fredService: FredService,
    private serpApiService: SerpApiService,
  ) {
    this.economicDataTtl = parseInt(process.env.ECONOMIC_DATA_TTL || '86400'); // 24 hours
    this.stockDataTtl = parseInt(process.env.STOCK_DATA_TTL || '300'); // 5 minutes
  }

  async getEconomicIndicators(): Promise<EconomicIndicators> {
    const cacheKey = 'economic-indicators';
    
    try {
      // Try to get from cache first
      const cached = await this.cacheService.get<EconomicIndicators>(cacheKey);
      if (cached) {
        this.logger.log('Retrieved economic indicators from cache');
        return cached;
      }

      // Fetch fresh data from FRED API
      this.logger.log('Fetching fresh economic indicators from FRED API');
      const economicData = await this.fredService.getAllEconomicIndicators();
      
      // Process and transform the data
      const indicators: EconomicIndicators = {
        cpi: {
          value: economicData.cpi?.value || 0,
          monthOverMonth: 0.2, // Calculate from historical data if available
          direction: 'up' as const,
        },
        interestRate: {
          value: economicData.interestRate?.value || 0,
        },
        unemploymentRate: {
          value: economicData.unemploymentRate?.value || 0,
          monthOverMonth: -0.1, // Calculate from historical data if available
        },
      };

      // Cache the result
      await this.cacheService.set(cacheKey, indicators, this.economicDataTtl);
      this.logger.log('Cached economic indicators for 24 hours');
      
      return indicators;
    } catch (error) {
      this.logger.error('Failed to fetch economic indicators:', error.message);
      throw error;
    }
  }

  async getMarketIndices(): Promise<MarketIndices> {
    const cacheKey = 'market-indices';
    
    try {
      // Try to get from cache first
      const cached = await this.cacheService.get<MarketIndices>(cacheKey);
      if (cached) {
        this.logger.log('Retrieved market indices from cache');
        return cached;
      }

      // Fetch fresh data from SerpApi
      this.logger.log('Fetching fresh market indices from SerpApi');
      const [sp500Result, vixResult] = await Promise.allSettled([
        this.serpApiService.getMarketIndex('.INX:INDEXSP'),
        this.serpApiService.getMarketIndex('VIX:INDEXCBOE'),
      ]);

      const sp500Data = sp500Result.status === 'fulfilled' ? sp500Result.value : null;
      const vixData = vixResult.status === 'fulfilled' ? vixResult.value : null;

      // Process and transform the data
      const indices: MarketIndices = {
        sp500: {
          value: this.extractPrice(sp500Data) || 0,
          change: this.extractChange(sp500Data) || 0,
          changePercent: this.extractChangePercent(sp500Data) || 0,
          sparkline: await this.getSparklineData('.INX:INDEXSP'),
        },
        vix: {
          value: this.extractPrice(vixData) || 0,
          status: this.getVixStatus(this.extractPrice(vixData) || 0),
        },
      };

      // Cache the result with shorter TTL for market data
      await this.cacheService.set(cacheKey, indices, this.stockDataTtl);
      this.logger.log(`Cached market indices for ${this.stockDataTtl / 60} minutes`);
      
      return indices;
    } catch (error) {
      this.logger.error('Failed to fetch market indices:', error.message);
      throw error;
    }
  }

  private async getSparklineData(symbol: string): Promise<Array<{ date: string; value: number }>> {
    try {
      const chartData = await this.serpApiService.getChartData(symbol, '1W', '1d');
      
      if (chartData?.chart && Array.isArray(chartData.chart)) {
        return chartData.chart.map((point: any) => ({
          date: point.datetime || point.date || new Date().toISOString(),
          value: parseFloat(point.value || point.price || 0),
        }));
      }
      
      // Return empty array if no chart data available
      return [];
    } catch (error) {
      this.logger.error(`Failed to fetch sparkline data for ${symbol}:`, error.message);
      return [];
    }
  }

  private extractPrice(data: any): number | null {
    try {
      return data?.summary?.price?.value || 
             data?.price || 
             parseFloat(data?.current_price) || 
             null;
    } catch {
      return null;
    }
  }

  private extractChange(data: any): number | null {
    try {
      return data?.summary?.price?.change || 
             data?.change || 
             parseFloat(data?.price_change) || 
             null;
    } catch {
      return null;
    }
  }

  private extractChangePercent(data: any): number | null {
    try {
      return data?.summary?.price?.change_percent || 
             data?.change_percent || 
             parseFloat(data?.price_change_percent) || 
             null;
    } catch {
      return null;
    }
  }

  private getVixStatus(vixValue: number): 'Low' | 'Moderate' | 'High' | 'Extreme' {
    if (vixValue < 20) return 'Low';
    if (vixValue < 30) return 'Moderate';
    if (vixValue < 40) return 'High';
    return 'Extreme';
  }

  async clearCache(): Promise<void> {
    try {
      await this.cacheService.del('economic-indicators');
      await this.cacheService.del('market-indices');
      this.logger.log('Cleared financial data cache');
    } catch (error) {
      this.logger.error('Failed to clear cache:', error.message);
    }
  }
}