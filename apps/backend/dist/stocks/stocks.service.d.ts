import type { StockCardData, StockSymbol } from '@investie/types';
import { NewsService } from '../news/news.service';
export declare class StocksService {
    private readonly newsService;
    private readonly logger;
    constructor(newsService: NewsService);
    getAllStocks(): StockCardData[];
    getStock(symbol: StockSymbol): Promise<StockCardData | null>;
    getStockSync(symbol: StockSymbol): StockCardData | null;
}
