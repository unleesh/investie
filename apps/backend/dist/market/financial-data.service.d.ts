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
        sparkline: Array<{
            date: string;
            value: number;
        }>;
    };
    vix: {
        value: number;
        status: 'Low' | 'Moderate' | 'High' | 'Extreme';
    };
}
export declare class FinancialDataService {
    private cacheService;
    private fredService;
    private serpApiService;
    private readonly logger;
    private readonly economicDataTtl;
    private readonly stockDataTtl;
    constructor(cacheService: CacheService, fredService: FredService, serpApiService: SerpApiService);
    getEconomicIndicators(): Promise<EconomicIndicators>;
    getMarketIndices(): Promise<MarketIndices>;
    private getSparklineData;
    private extractPrice;
    private extractChange;
    private extractChangePercent;
    private getVixStatus;
    clearCache(): Promise<void>;
}
export {};
