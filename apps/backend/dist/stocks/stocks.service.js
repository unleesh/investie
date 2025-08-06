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
const news_service_1 = require("../news/news.service");
let StocksService = StocksService_1 = class StocksService {
    newsService;
    logger = new common_1.Logger(StocksService_1.name);
    constructor(newsService) {
        this.newsService = newsService;
    }
    getAllStocks() {
        return (0, mock_1.getAllStocks)();
    }
    async getStock(symbol) {
        try {
            const stockData = (0, mock_1.getStock)(symbol);
            if (!stockData) {
                return null;
            }
            return stockData;
        }
        catch (error) {
            this.logger.error(`Failed to get stock data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return (0, mock_1.getStock)(symbol) || null;
        }
    }
    getStockSync(symbol) {
        const stock = (0, mock_1.getStock)(symbol);
        return stock || null;
    }
};
exports.StocksService = StocksService;
exports.StocksService = StocksService = StocksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], StocksService);
//# sourceMappingURL=stocks.service.js.map