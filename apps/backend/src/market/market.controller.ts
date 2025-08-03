import { Controller, Get } from '@nestjs/common';
import { MarketService } from './market.service';
import type { MarketSummaryData } from '@investie/types';

@Controller('api/v1/market-summary')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get()
  getMarketSummary(): MarketSummaryData {
    return this.marketService.getSummary();
  }
}