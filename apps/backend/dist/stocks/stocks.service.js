"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StocksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StocksService = void 0;
const common_1 = require("@nestjs/common");
const mock_1 = require("@investie/mock");
const serpapi_service_1 = require("../services/serpapi.service");
let StocksService = StocksService_1 = class StocksService {
    serpApiService;
    logger = new common_1.Logger(StocksService_1.name);
    constructor(serpApiService) {
        this.serpApiService = serpApiService;
    }
    async getAllStocks() {
        const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'AVGO', 'AMD'];
        try {
            this.logger.log('Fetching all stocks data from APIs');
            const stockPromises = symbols.map(symbol => this.getStockData(symbol));
            const results = await Promise.allSettled(stockPromises);
            return results
                .filter((result) => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);
        }
        catch (error) {
            this.logger.error('Failed to fetch all stocks, using mock data:', error.message);
            return (0, mock_1.getAllStocks)();
        }
    }
    async getStock(symbol) {
        try {
            return await this.getStockData(symbol);
        }
        catch (error) {
            this.logger.error(`Failed to fetch ${symbol}, using mock data:`, error.message);
            const fallback = (0, mock_1.getStock)(symbol);
            return fallback || null;
        }
    }
    async getStockChart(symbol, period = '1W') {
        try {
            this.logger.log(`Fetching chart data for ${symbol} (${period})`);
            return await this.serpApiService.getChartData(`${symbol}:NASDAQ`, period);
        }
        catch (error) {
            this.logger.error(`Failed to fetch chart for ${symbol}:`, error.message);
            return null;
        }
    }
    async getStockData(symbol) {
        try {
            const [stockData, newsData] = await Promise.allSettled([
                this.serpApiService.getStockData(symbol),
                this.serpApiService.getStockNews(symbol),
            ]);
            const stock = stockData.status === 'fulfilled' ? stockData.value : null;
            const news = newsData.status === 'fulfilled' ? newsData.value : [];
            return this.transformToStockCardData(stock, news, symbol);
        }
        catch (error) {
            this.logger.error(`Failed to fetch data for ${symbol}:`, error.message);
            const fallback = (0, mock_1.getStock)(symbol);
            return fallback || null;
        }
    }
    transformToStockCardData(stockData, newsData, symbol) {
        try {
            const mockStock = (0, mock_1.getStock)(symbol);
            if (!mockStock) {
                this.logger.error(`No mock data available for ${symbol}`);
                return null;
            }
            return {
                symbol,
                name: stockData?.summary?.title || mockStock.name,
                price: {
                    current: this.extractPrice(stockData) || mockStock.price.current,
                    change: this.extractChange(stockData) || mockStock.price.change,
                    changePercent: this.extractChangePercent(stockData) || mockStock.price.changePercent,
                    source: 'google_finance',
                },
                priceChart: mockStock.priceChart,
                fundamentals: {
                    pe: this.extractPE(stockData) || mockStock.fundamentals.pe,
                    marketCap: this.parseMarketCap(this.extractMarketCap(stockData)) || mockStock.fundamentals.marketCap,
                    volume: this.extractVolume(stockData) || mockStock.fundamentals.volume,
                    fiftyTwoWeekHigh: mockStock.fundamentals.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: mockStock.fundamentals.fiftyTwoWeekLow,
                    source: 'google_finance',
                },
                technicals: {
                    rsi: mockStock.technicals.rsi,
                    rsiStatus: mockStock.technicals.rsiStatus,
                },
                aiEvaluation: mockStock.aiEvaluation,
                newsSummary: this.transformToNewsSummary(newsData) || mockStock.newsSummary,
                sectorPerformance: mockStock.sectorPerformance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to transform data for ${symbol}:`, error.message);
            const fallback = (0, mock_1.getStock)(symbol);
            return fallback || null;
        }
    }
    extractPrice(data) {
        try {
            return data?.summary?.price?.value || data?.price || null;
        }
        catch {
            return null;
        }
    }
    extractChange(data) {
        try {
            return data?.summary?.price?.change || data?.change || null;
        }
        catch {
            return null;
        }
    }
    extractChangePercent(data) {
        try {
            return data?.summary?.price?.change_percent || data?.change_percent || null;
        }
        catch {
            return null;
        }
    }
    extractMarketCap(data) {
        try {
            return data?.summary?.market_cap || data?.market_cap || null;
        }
        catch {
            return null;
        }
    }
    extractPE(data) {
        try {
            return data?.summary?.pe_ratio || data?.pe_ratio || null;
        }
        catch {
            return null;
        }
    }
    extractVolume(data) {
        try {
            return data?.summary?.volume || data?.volume || null;
        }
        catch {
            return null;
        }
    }
    parseMarketCap(marketCapString) {
        if (!marketCapString)
            return null;
        try {
            const numStr = marketCapString.replace(/[^0-9.]/g, '');
            const num = parseFloat(numStr);
            if (isNaN(num))
                return null;
            if (marketCapString.includes('T'))
                return num * 1000000000000;
            if (marketCapString.includes('B'))
                return num * 1000000000;
            if (marketCapString.includes('M'))
                return num * 1000000;
            return num;
        }
        catch {
            return null;
        }
    }
    transformToNewsSummary(newsData) {
        try {
            if (!Array.isArray(newsData) || newsData.length === 0) {
                return null;
            }
            const firstNews = newsData[0];
            return {
                headline: firstNews.title || 'Market Update',
                sentiment: 'neutral',
                source: 'google_news + claude_ai',
            };
        }
        catch {
            return null;
        }
    }
};
exports.StocksService = StocksService;
exports.StocksService = StocksService = StocksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [serpapi_service_1.SerpApiService])
], StocksService);
//# sourceMappingURL=stocks.service.js.map