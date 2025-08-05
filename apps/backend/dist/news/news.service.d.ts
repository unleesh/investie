import type { StockSymbol, StockNewsSummary } from '@investie/types';
export declare class NewsService {
    private readonly logger;
    private readonly serpApiKey;
    private readonly baseUrl;
    private readonly dataDir;
    private readonly openai;
    constructor();
    getStockNews(symbol: StockSymbol): Promise<StockNewsSummary | null>;
    private getCompanyName;
    private analyzeSentimentWithAI;
    private tryClaudeSentiment;
    private tryOpenAISentiment;
    private fallbackSentiment;
    private storeNewsData;
    getStoredNewsData(symbol: StockSymbol): any | null;
}
