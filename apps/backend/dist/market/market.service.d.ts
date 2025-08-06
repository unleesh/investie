import type { MarketSummaryData } from '@investie/types';
import { FinancialDataService } from './financial-data.service';
export declare class MarketService {
    private financialDataService;
    private readonly logger;
    constructor(financialDataService: FinancialDataService);
    getSummary(): Promise<MarketSummaryData>;
    private transformToMarketSummary;
}
