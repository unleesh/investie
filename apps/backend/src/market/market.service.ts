import { Injectable } from '@nestjs/common';
import type { MarketSummaryData } from '@investie/types';
import { getMarketSummary } from '@investie/mock';

@Injectable()
export class MarketService {
  getSummary(): MarketSummaryData {
    // Initially, just return the mock data
    // Later this will integrate with FRED API, Google Finance, and Claude API
    return getMarketSummary();
  }
}