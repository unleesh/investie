export declare class SerpApiService {
    private readonly logger;
    getStockData(symbol: string, exchange?: string): Promise<import("serpapi").BaseResponse>;
    getMarketIndex(symbol: string): Promise<import("serpapi").BaseResponse>;
    getChartData(symbol: string, period?: string, interval?: string): Promise<import("serpapi").BaseResponse>;
    getStockNews(symbol: string): Promise<any>;
}
