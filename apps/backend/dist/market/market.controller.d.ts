import { MarketService } from './market.service';
import type { MarketSummaryData } from '@investie/types';
export declare class MarketController {
    private readonly marketService;
    constructor(marketService: MarketService);
    getMarketSummary(): MarketSummaryData;
}
