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
const financial_data_service_1 = require("./financial-data.service");
let MarketService = MarketService_1 = class MarketService {
    financialDataService;
    logger = new common_1.Logger(MarketService_1.name);
    constructor(financialDataService) {
        this.financialDataService = financialDataService;
    }
    async getSummary() {
        try {
            this.logger.log('Fetching market summary data from enhanced financial service');
            const [economicData, marketData] = await Promise.allSettled([
                this.financialDataService.getEconomicIndicators(),
                this.financialDataService.getMarketIndices(),
            ]);
            const economics = economicData.status === 'fulfilled' ? economicData.value : null;
            const markets = marketData.status === 'fulfilled' ? marketData.value : null;
            return this.transformToMarketSummary(economics, markets);
        }
        catch (error) {
            this.logger.error('Failed to fetch market data, falling back to mock data:', error.message);
            return (0, mock_1.getMarketSummary)();
        }
    }
    transformToMarketSummary(economics, markets) {
        try {
            const mockData = (0, mock_1.getMarketSummary)();
            return {
                fearGreedIndex: {
                    value: mockData.fearGreedIndex.value,
                    status: mockData.fearGreedIndex.status,
                    source: mockData.fearGreedIndex.source,
                },
                vix: {
                    value: markets?.vix?.value || mockData.vix.value,
                    status: markets?.vix?.status || mockData.vix.status,
                    source: mockData.vix.source,
                },
                interestRate: {
                    value: economics?.interestRate?.value || mockData.interestRate.value,
                    aiOutlook: mockData.interestRate.aiOutlook,
                    source: mockData.interestRate.source,
                },
                cpi: {
                    value: economics?.cpi?.value || mockData.cpi.value,
                    monthOverMonth: economics?.cpi?.monthOverMonth || mockData.cpi.monthOverMonth,
                    direction: economics?.cpi?.direction || mockData.cpi.direction,
                    source: mockData.cpi.source,
                },
                unemploymentRate: {
                    value: economics?.unemploymentRate?.value || mockData.unemploymentRate.value,
                    monthOverMonth: economics?.unemploymentRate?.monthOverMonth || mockData.unemploymentRate.monthOverMonth,
                    source: mockData.unemploymentRate.source,
                },
                sp500Sparkline: markets?.sp500?.sparkline || mockData.sp500Sparkline,
            };
        }
        catch (error) {
            this.logger.error('Failed to transform market data:', error.message);
            return (0, mock_1.getMarketSummary)();
        }
    }
};
exports.MarketService = MarketService;
exports.MarketService = MarketService = MarketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_data_service_1.FinancialDataService])
], MarketService);
//# sourceMappingURL=market.service.js.map