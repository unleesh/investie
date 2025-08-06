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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const market_module_1 = require("./market/market.module");
const stocks_module_1 = require("./stocks/stocks.module");
const chat_module_1 = require("./chat/chat.module");
const cache_module_1 = require("./cache/cache.module");
const market_data_scheduler_1 = require("./market/market-data.scheduler");
const cache_service_1 = require("./cache/cache.service");
let AppModule = class AppModule {
    marketDataScheduler;
    cacheService;
    constructor(marketDataScheduler, cacheService) {
        this.marketDataScheduler = marketDataScheduler;
        this.cacheService = cacheService;
    }
    onModuleInit() {
        this.marketDataScheduler.startScheduler();
        this.cacheService.startCleanupTimer();
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [cache_module_1.CacheModule, market_module_1.MarketModule, stocks_module_1.StocksModule, chat_module_1.ChatModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    }),
    __metadata("design:paramtypes", [market_data_scheduler_1.MarketDataScheduler,
        cache_service_1.CacheService])
], AppModule);
//# sourceMappingURL=app.module.js.map