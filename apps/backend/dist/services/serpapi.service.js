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
var SerpApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serpapi_1 = require("serpapi");
let SerpApiService = SerpApiService_1 = class SerpApiService {
    configService;
    logger = new common_1.Logger(SerpApiService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async getStockData(symbol, exchange = 'NASDAQ') {
        try {
            const query = `${symbol}:${exchange}`;
            this.logger.log(`Fetching stock data for ${query}`);
            const result = await (0, serpapi_1.getJson)({
                engine: 'google_finance',
                api_key: this.configService.get('SERPAPI_API_KEY'),
                q: query,
                hl: 'en',
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch stock data for ${symbol}:`, error.message);
            throw error;
        }
    }
    async getMarketIndex(symbol) {
        try {
            this.logger.log(`Fetching market index for ${symbol}`);
            const result = await (0, serpapi_1.getJson)({
                engine: 'google_finance',
                api_key: this.configService.get('SERPAPI_API_KEY'),
                q: symbol,
                hl: 'en',
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch market index for ${symbol}:`, error.message);
            throw error;
        }
    }
    async getChartData(symbol, period = '1W', interval = '1d') {
        try {
            this.logger.log(`Fetching chart data for ${symbol} (${period})`);
            const result = await (0, serpapi_1.getJson)({
                engine: 'google_finance',
                api_key: this.configService.get('SERPAPI_API_KEY'),
                q: symbol,
                hl: 'en',
                prs: period,
                interval: interval,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch chart data for ${symbol}:`, error.message);
            throw error;
        }
    }
    async getStockNews(symbol) {
        try {
            this.logger.log(`Fetching news for ${symbol}`);
            const result = await (0, serpapi_1.getJson)({
                engine: 'google_finance',
                api_key: this.configService.get('SERPAPI_API_KEY'),
                q: symbol,
                hl: 'en',
                gl: 'us',
            });
            return result?.news || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch news for ${symbol}:`, error.message);
            return [];
        }
    }
};
exports.SerpApiService = SerpApiService;
exports.SerpApiService = SerpApiService = SerpApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SerpApiService);
//# sourceMappingURL=serpapi.service.js.map