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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketController = void 0;
const common_1 = require("@nestjs/common");
const market_service_1 = require("./market.service");
const market_data_scheduler_1 = require("./market-data.scheduler");
const financial_data_service_1 = require("./financial-data.service");
const cache_service_1 = require("../cache/cache.service");
let MarketController = class MarketController {
    marketService;
    marketDataScheduler;
    financialDataService;
    cacheService;
    constructor(marketService, marketDataScheduler, financialDataService, cacheService) {
        this.marketService = marketService;
        this.marketDataScheduler = marketDataScheduler;
        this.financialDataService = financialDataService;
        this.cacheService = cacheService;
    }
    async getMarketSummary() {
        return await this.marketService.getSummary();
    }
    async getHealthStatus() {
        const schedulerStatus = this.marketDataScheduler.getSchedulerStatus();
        const cacheStats = this.cacheService.getCacheStats();
        return {
            service: 'Market Data Service (BE1)',
            status: 'operational',
            scheduler: schedulerStatus,
            cache: cacheStats,
            timestamp: new Date().toISOString(),
        };
    }
    async forceUpdate() {
        await this.marketDataScheduler.forceUpdate();
        return {
            message: 'Market data update triggered successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async clearCache() {
        await this.financialDataService.clearCache();
        return {
            message: 'Financial data cache cleared successfully',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.MarketController = MarketController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getMarketSummary", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Post)('force-update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "forceUpdate", null);
__decorate([
    (0, common_1.Post)('clear-cache'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "clearCache", null);
exports.MarketController = MarketController = __decorate([
    (0, common_1.Controller)('api/v1/market-summary'),
    __metadata("design:paramtypes", [market_service_1.MarketService,
        market_data_scheduler_1.MarketDataScheduler,
        financial_data_service_1.FinancialDataService,
        cache_service_1.CacheService])
], MarketController);
//# sourceMappingURL=market.controller.js.map