import { Injectable, Logger } from '@nestjs/common';
import type { MarketSummaryData } from '@investie/types';
import { getMarketSummary } from '@investie/mock';
import { FinancialDataService } from './financial-data.service';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private financialDataService: FinancialDataService,
  ) {}

  async getSummary(): Promise<MarketSummaryData> {
    try {
      this.logger.log('Fetching market summary data from enhanced financial service');
      
      const [economicData, marketData] = await Promise.allSettled([
        this.financialDataService.getEconomicIndicators(),
        this.financialDataService.getMarketIndices(),
      ]);

      const economics = economicData.status === 'fulfilled' ? economicData.value : null;
      const markets = marketData.status === 'fulfilled' ? marketData.value : null;

      // Transform API data to MarketSummaryData format
      return this.transformToMarketSummary(economics, markets);
    } catch (error) {
      this.logger.error('Failed to fetch market data, falling back to mock data:', error.message);
      return getMarketSummary();
    }
  }

  private transformToMarketSummary(
    economics: any,
    markets: any,
  ): MarketSummaryData {
    try {
      // Get mock data as fallback template
      const mockData = getMarketSummary();

      return {
        fearGreedIndex: {
          value: mockData.fearGreedIndex.value, // Will be handled by BE2 (AI service)
          status: mockData.fearGreedIndex.status,
          source: mockData.fearGreedIndex.source,
        },
        vix: {
          value: markets?.vix?.value || mockData.vix.value,
          status: markets?.vix?.status || mockData.vix.status,
          source: mockData.vix.source,
        },
        interestRate: {
          value: economics?.interestRate?.value || mockData.interestRate.value,
          aiOutlook: mockData.interestRate.aiOutlook, // Will be handled by BE2 (AI service)
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

}