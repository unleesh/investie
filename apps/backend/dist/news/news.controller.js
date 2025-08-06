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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NewsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const news_service_1 = require("./news.service");
let NewsController = NewsController_1 = class NewsController {
    newsService;
    logger = new common_1.Logger(NewsController_1.name);
    constructor(newsService) {
        this.newsService = newsService;
    }
    async processStockNews(request) {
        this.logger.log(`Processing news request for symbol: ${request.symbol}`);
        try {
            if (!request.symbol || typeof request.symbol !== 'string') {
                throw new common_1.HttpException('Symbol is required and must be a string', common_1.HttpStatus.BAD_REQUEST);
            }
            const symbol = request.symbol.trim();
            if (!symbol) {
                throw new common_1.HttpException('Symbol cannot be empty', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.newsService.processStockNews(symbol);
            if (!result.isValid) {
                return {
                    success: false,
                    error: result.error,
                    suggestions: result.suggestions
                };
            }
            return {
                success: true,
                data: {
                    symbol: result.symbol,
                    overview: result.overview,
                    validationResult: result.validationResult
                }
            };
        }
        catch (error) {
            this.logger.error(`Error processing news for symbol ${request.symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            throw new common_1.HttpException(`Failed to process news: ${error instanceof Error ? error.message : 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "processStockNews", null);
exports.NewsController = NewsController = NewsController_1 = __decorate([
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsController);
//# sourceMappingURL=news.controller.js.map