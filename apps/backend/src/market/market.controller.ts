import { Controller, Get, Post } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketDataScheduler } from './market-data.scheduler';
import { FinancialDataService } from './financial-data.service';
import { CacheService } from '../cache/cache.service';
import type { MarketSummaryData } from '@investie/types';

@Controller('api/v1/market-summary')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly marketDataScheduler: MarketDataScheduler,
    private readonly financialDataService: FinancialDataService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async getMarketSummary(): Promise<MarketSummaryData> {
    return await this.marketService.getSummary();
  }

  @Get('health')
  async getHealthStatus() {
    const schedulerStatus = this.marketDataScheduler.getSchedulerStatus();
    const cacheStats = this.cacheService.getCacheStats();
    
    return {
      service: 'Market Data Service (BE1)',
      status: 'operational',
      scheduler: schedulerStatus,
      cache: cacheStats,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('force-update')
  async forceUpdate() {
    await this.marketDataScheduler.forceUpdate();
    return {
      message: 'Market data update triggered successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('clear-cache')
  async clearCache() {
    await this.financialDataService.clearCache();
    return {
      message: 'Financial data cache cleared successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
