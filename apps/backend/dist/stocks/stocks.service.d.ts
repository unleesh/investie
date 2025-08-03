import type { StockCardData, StockSymbol } from '@investie/types';
export declare class StocksService {
    getAllStocks(): StockCardData[];
    getStock(symbol: StockSymbol): StockCardData | null;
}
