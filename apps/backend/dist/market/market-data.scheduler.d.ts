import { FinancialDataService } from './financial-data.service';
export declare class MarketDataScheduler {
    private financialDataService;
    private readonly logger;
    private readonly isProduction;
    private readonly updateIntervals;
    private economicDataTimer?;
    private marketDataTimer?;
    constructor(financialDataService: FinancialDataService);
    startScheduler(): void;
    stopScheduler(): void;
    private performInitialDataFetch;
    private updateEconomicData;
    private updateMarketData;
    private isTradingHours;
    forceUpdate(): Promise<void>;
    getSchedulerStatus(): {
        isRunning: boolean;
        isProduction: boolean;
        nextEconomicUpdate: Date | null;
        nextMarketUpdate: Date | null;
    };
}
