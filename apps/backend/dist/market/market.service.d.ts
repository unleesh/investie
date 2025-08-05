import type { MarketSummaryData } from '@investie/types';
import { SerpApiService } from '../services/serpapi.service';
import { FredService } from '../services/fred.service';
export declare class MarketService {
    private serpApiService;
    private fredService;
    private readonly logger;
    constructor(serpApiService: SerpApiService, fredService: FredService);
    getSummary(): Promise<MarketSummaryData>;
    private transformToMarketSummary;
    private extractPrice;
    private extractChange;
    private extractChangePercent;
}
