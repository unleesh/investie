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
var FinancialDataService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialDataService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../cache/cache.service");
const fred_service_1 = require("../services/fred.service");
const serpapi_service_1 = require("../services/serpapi.service");
let FinancialDataService = FinancialDataService_1 = class FinancialDataService {
    cacheService;
    fredService;
    serpApiService;
    logger = new common_1.Logger(FinancialDataService_1.name);
    economicDataTtl;
    stockDataTtl;
    constructor(cacheService, fredService, serpApiService) {
        this.cacheService = cacheService;
        this.fredService = fredService;
        this.serpApiService = serpApiService;
        this.economicDataTtl = parseInt(process.env.ECONOMIC_DATA_TTL || '86400');
        this.stockDataTtl = parseInt(process.env.STOCK_DATA_TTL || '300');
    }
    async getEconomicIndicators() {
        const cacheKey = 'economic-indicators';
        try {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                this.logger.log('Retrieved economic indicators from cache');
                return cached;
            }
            this.logger.log('Fetching fresh economic indicators from FRED API');
            const economicData = await this.fredService.getAllEconomicIndicators();
            const indicators = {
                cpi: {
                    value: economicData.cpi?.value || 0,
                    monthOverMonth: 0.2,
                    direction: 'up',
                },
                interestRate: {
                    value: economicData.interestRate?.value || 0,
                },
                unemploymentRate: {
                    value: economicData.unemploymentRate?.value || 0,
                    monthOverMonth: -0.1,
                },
            };
            await this.cacheService.set(cacheKey, indicators, this.economicDataTtl);
            this.logger.log('Cached economic indicators for 24 hours');
            return indicators;
        }
        catch (error) {
            this.logger.error('Failed to fetch economic indicators:', error.message);
            throw error;
        }
    }
    async getMarketIndices() {
        const cacheKey = 'market-indices';
        try {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                this.logger.log('Retrieved market indices from cache');
                return cached;
            }
            this.logger.log('Fetching fresh market indices from SerpApi');
            const [sp500Result, vixResult] = await Promise.allSettled([
                this.serpApiService.getMarketIndex('.INX:INDEXSP'),
                this.serpApiService.getMarketIndex('VIX:INDEXCBOE'),
            ]);
            const sp500Data = sp500Result.status === 'fulfilled' ? sp500Result.value : null;
            const vixData = vixResult.status === 'fulfilled' ? vixResult.value : null;
            const indices = {
                sp500: {
                    value: this.extractPrice(sp500Data) || 0,
                    change: this.extractChange(sp500Data) || 0,
                    changePercent: this.extractChangePercent(sp500Data) || 0,
                    sparkline: await this.getSparklineData('.INX:INDEXSP'),
                },
                vix: {
                    value: this.extractPrice(vixData) || 0,
                    status: this.getVixStatus(this.extractPrice(vixData) || 0),
                },
            };
            await this.cacheService.set(cacheKey, indices, this.stockDataTtl);
            this.logger.log(`Cached market indices for ${this.stockDataTtl / 60} minutes`);
            return indices;
        }
        catch (error) {
            this.logger.error('Failed to fetch market indices:', error.message);
            throw error;
        }
    }
    async getSparklineData(symbol) {
        try {
            const chartData = await this.serpApiService.getChartData(symbol, '1W', '1d');
            if (chartData?.chart && Array.isArray(chartData.chart)) {
                return chartData.chart.map((point) => ({
                    date: point.datetime || point.date || new Date().toISOString(),
                    value: parseFloat(point.value || point.price || 0),
                }));
            }
            return [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch sparkline data for ${symbol}:`, error.message);
            return [];
        }
    }
    extractPrice(data) {
        try {
            return data?.summary?.price?.value ||
                data?.price ||
                parseFloat(data?.current_price) ||
                null;
        }
        catch {
            return null;
        }
    }
    extractChange(data) {
        try {
            return data?.summary?.price?.change ||
                data?.change ||
                parseFloat(data?.price_change) ||
                null;
        }
        catch {
            return null;
        }
    }
    extractChangePercent(data) {
        try {
            return data?.summary?.price?.change_percent ||
                data?.change_percent ||
                parseFloat(data?.price_change_percent) ||
                null;
        }
        catch {
            return null;
        }
    }
    getVixStatus(vixValue) {
        if (vixValue < 20)
            return 'Low';
        if (vixValue < 30)
            return 'Moderate';
        if (vixValue < 40)
            return 'High';
        return 'Extreme';
    }
    async clearCache() {
        try {
            await this.cacheService.del('economic-indicators');
            await this.cacheService.del('market-indices');
            this.logger.log('Cleared financial data cache');
        }
        catch (error) {
            this.logger.error('Failed to clear cache:', error.message);
        }
    }
};
exports.FinancialDataService = FinancialDataService;
exports.FinancialDataService = FinancialDataService = FinancialDataService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        fred_service_1.FredService,
        serpapi_service_1.SerpApiService])
], FinancialDataService);
//# sourceMappingURL=financial-data.service.js.map