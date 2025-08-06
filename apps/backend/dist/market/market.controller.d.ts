import { MarketService } from './market.service';
import { MarketDataScheduler } from './market-data.scheduler';
import { FinancialDataService } from './financial-data.service';
import { CacheService } from '../cache/cache.service';
import type { MarketSummaryData } from '@investie/types';
export declare class MarketController {
    private readonly marketService;
    private readonly marketDataScheduler;
    private readonly financialDataService;
    private readonly cacheService;
    constructor(marketService: MarketService, marketDataScheduler: MarketDataScheduler, financialDataService: FinancialDataService, cacheService: CacheService);
    getMarketSummary(): Promise<MarketSummaryData>;
    getHealthStatus(): Promise<{
        service: string;
        status: string;
        scheduler: {
            isRunning: boolean;
            isProduction: boolean;
            nextEconomicUpdate: Date | null;
            nextMarketUpdate: Date | null;
        };
        cache: {
            size: number;
            items: Array<{
                key: string;
                expiresAt: Date;
                isExpired: boolean;
            }>;
        };
        timestamp: string;
    }>;
    forceUpdate(): Promise<{
        message: string;
        timestamp: string;
    }>;
    clearCache(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
