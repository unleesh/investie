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
var MarketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const mock_1 = require("@investie/mock");
const serpapi_service_1 = require("../services/serpapi.service");
const fred_service_1 = require("../services/fred.service");
let MarketService = MarketService_1 = class MarketService {
    serpApiService;
    fredService;
    logger = new common_1.Logger(MarketService_1.name);
    constructor(serpApiService, fredService) {
        this.serpApiService = serpApiService;
        this.fredService = fredService;
    }
    async getSummary() {
        try {
            this.logger.log('Fetching market summary data from APIs');
            const [sp500Result, vixResult, economicData] = await Promise.allSettled([
                this.serpApiService.getMarketIndex('.INX:INDEXSP'),
                this.serpApiService.getMarketIndex('VIX:INDEXCBOE'),
                this.fredService.getAllEconomicIndicators(),
            ]);
            const sp500Data = sp500Result.status === 'fulfilled' ? sp500Result.value : null;
            const vixData = vixResult.status === 'fulfilled' ? vixResult.value : null;
            const economics = economicData.status === 'fulfilled' ? economicData.value : null;
            return this.transformToMarketSummary(sp500Data, vixData, economics);
        }
        catch (error) {
            this.logger.error('Failed to fetch market data, falling back to mock data:', error.message);
            return (0, mock_1.getMarketSummary)();
        }
    }
    transformToMarketSummary(sp500Data, vixData, economics) {
        try {
            const mockData = (0, mock_1.getMarketSummary)();
            return {
                fearGreedIndex: {
                    value: mockData.fearGreedIndex.value,
                    status: mockData.fearGreedIndex.status,
                    source: mockData.fearGreedIndex.source,
                },
                vix: {
                    value: this.extractPrice(vixData) || mockData.vix.value,
                    status: mockData.vix.status,
                    source: mockData.vix.source,
                },
                interestRate: {
                    value: economics?.interestRate?.value || mockData.interestRate.value,
                    aiOutlook: mockData.interestRate.aiOutlook,
                    source: mockData.interestRate.source,
                },
                cpi: {
                    value: economics?.cpi?.value || mockData.cpi.value,
                    monthOverMonth: mockData.cpi.monthOverMonth,
                    direction: mockData.cpi.direction,
                    source: mockData.cpi.source,
                },
                unemploymentRate: {
                    value: economics?.unemploymentRate?.value || mockData.unemploymentRate.value,
                    monthOverMonth: mockData.unemploymentRate.monthOverMonth,
                    source: mockData.unemploymentRate.source,
                },
                sp500Sparkline: mockData.sp500Sparkline,
            };
        }
        catch (error) {
            this.logger.error('Failed to transform market data:', error.message);
            return (0, mock_1.getMarketSummary)();
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
};
exports.MarketService = MarketService;
exports.MarketService = MarketService = MarketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [serpapi_service_1.SerpApiService,
        fred_service_1.FredService])
], MarketService);
//# sourceMappingURL=market.service.js.map