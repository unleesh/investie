import { Injectable, Logger } from '@nestjs/common';
import type { MarketSummaryData } from '@investie/types';
import { getMarketSummary } from '@investie/mock';
import { SerpApiService } from '../services/serpapi.service';
import { FredService } from '../services/fred.service';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private serpApiService: SerpApiService,
    private fredService: FredService,
  ) {}

  async getSummary(): Promise<MarketSummaryData> {
    try {
      this.logger.log('Fetching market summary data from APIs');
      
      const [sp500Result, vixResult, economicData] = await Promise.allSettled([
        this.serpApiService.getMarketIndex('.INX:INDEXSP'),
        this.serpApiService.getMarketIndex('VIX:INDEXCBOE'),
        this.fredService.getAllEconomicIndicators(),
      ]);

      // Extract data from successful API calls
      const sp500Data = sp500Result.status === 'fulfilled' ? sp500Result.value : null;
      const vixData = vixResult.status === 'fulfilled' ? vixResult.value : null;
      const economics = economicData.status === 'fulfilled' ? economicData.value : null;

      // Transform API data to MarketSummaryData format
      return this.transformToMarketSummary(sp500Data, vixData, economics);
    } catch (error) {
      this.logger.error('Failed to fetch market data, falling back to mock data:', error.message);
      return getMarketSummary();
    }
  }

  private transformToMarketSummary(
    sp500Data: any,
    vixData: any,
    economics: any,
  ): MarketSummaryData {
    try {
      // Get mock data as fallback template
      const mockData = getMarketSummary();

      return {
        fearGreedIndex: {
          value: mockData.fearGreedIndex.value,
          status: mockData.fearGreedIndex.status,
          source: mockData.fearGreedIndex.source,
        },
        vix: {
          value: this.extractPrice(vixData) || mockData.vix.value,
          status: mockData.vix.status,
          source: mockData.vix.source,
        },
        interestRate: {
          value: economics?.interestRate?.value || mockData.interestRate.value,
          aiOutlook: mockData.interestRate.aiOutlook,
          source: mockData.interestRate.source,
        },
        cpi: {
          value: economics?.cpi?.value || mockData.cpi.value,
          monthOverMonth: mockData.cpi.monthOverMonth,
          direction: mockData.cpi.direction,
          source: mockData.cpi.source,
        },
        unemploymentRate: {
          value: economics?.unemploymentRate?.value || mockData.unemploymentRate.value,
          monthOverMonth: mockData.unemploymentRate.monthOverMonth,
          source: mockData.unemploymentRate.source,
        },
        sp500Sparkline: mockData.sp500Sparkline,
      };
    } catch (error) {
      this.logger.error('Failed to transform market data:', error.message);
      return getMarketSummary();
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
}