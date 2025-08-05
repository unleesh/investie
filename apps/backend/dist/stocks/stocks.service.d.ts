import type { StockCardData, StockSymbol } from '@investie/types';
import { SerpApiService } from '../services/serpapi.service';
export declare class StocksService {
    private serpApiService;
    private readonly logger;
    constructor(serpApiService: SerpApiService);
    getAllStocks(): Promise<StockCardData[]>;
    getStock(symbol: StockSymbol): Promise<StockCardData | null>;
    getStockChart(symbol: StockSymbol, period?: string): Promise<any>;
    private getStockData;
    private transformToStockCardData;
    private extractPrice;
    private extractChange;
    private extractChangePercent;
    private extractMarketCap;
    private extractPE;
    private extractVolume;
    private parseMarketCap;
    private transformToNewsSummary;
}
