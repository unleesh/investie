import { StocksService } from './stocks.service';
import type { StockCardData, StockSymbol } from '@investie/types';
export declare class StocksController {
    private readonly stocksService;
    constructor(stocksService: StocksService);
    getAllStocks(): StockCardData[];
    getStock(symbol: StockSymbol): Promise<StockCardData | null>;
}
