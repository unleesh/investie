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
var MarketDataScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataScheduler = void 0;
const common_1 = require("@nestjs/common");
const financial_data_service_1 = require("./financial-data.service");
let MarketDataScheduler = MarketDataScheduler_1 = class MarketDataScheduler {
    financialDataService;
    logger = new common_1.Logger(MarketDataScheduler_1.name);
    isProduction;
    updateIntervals = {
        economic: 6 * 60 * 60 * 1000,
        market: 5 * 60 * 1000,
    };
    economicDataTimer;
    marketDataTimer;
    constructor(financialDataService) {
        this.financialDataService = financialDataService;
        this.isProduction = process.env.NODE_ENV === 'production';
    }
    startScheduler() {
        if (!this.isProduction) {
            this.logger.log('Scheduler disabled in development mode');
            return;
        }
        this.logger.log('Starting market data scheduler...');
        this.economicDataTimer = setInterval(async () => {
            await this.updateEconomicData();
        }, this.updateIntervals.economic);
        this.marketDataTimer = setInterval(async () => {
            if (this.isTradingHours()) {
                await this.updateMarketData();
            }
        }, this.updateIntervals.market);
        this.performInitialDataFetch();
        this.logger.log('Market data scheduler started successfully');
    }
    stopScheduler() {
        if (this.economicDataTimer) {
            clearInterval(this.economicDataTimer);
            this.economicDataTimer = undefined;
        }
        if (this.marketDataTimer) {
            clearInterval(this.marketDataTimer);
            this.marketDataTimer = undefined;
        }
        this.logger.log('Market data scheduler stopped');
    }
    async performInitialDataFetch() {
        try {
            this.logger.log('Performing initial data fetch...');
            await Promise.allSettled([
                this.updateEconomicData(),
                this.updateMarketData(),
            ]);
            this.logger.log('Initial data fetch completed');
        }
        catch (error) {
            this.logger.error('Initial data fetch failed:', error.message);
        }
    }
    async updateEconomicData() {
        try {
            this.logger.log('Updating economic indicators...');
            await this.financialDataService.getEconomicIndicators();
            this.logger.log('Economic indicators updated successfully');
        }
        catch (error) {
            this.logger.error('Failed to update economic data:', error.message);
        }
    }
    async updateMarketData() {
        try {
            this.logger.log('Updating market indices...');
            await this.financialDataService.getMarketIndices();
            this.logger.log('Market indices updated successfully');
        }
        catch (error) {
            this.logger.error('Failed to update market data:', error.message);
        }
    }
    isTradingHours() {
        const now = new Date();
        const easternTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: 'numeric',
            weekday: 'short',
        }).formatToParts(now);
        const weekday = easternTime.find(part => part.type === 'weekday')?.value;
        const hour = parseInt(easternTime.find(part => part.type === 'hour')?.value || '0');
        if (weekday === 'Sat' || weekday === 'Sun') {
            return false;
        }
        return hour >= 9 && hour <= 16;
    }
    async forceUpdate() {
        this.logger.log('Forcing market data update...');
        await Promise.allSettled([
            this.updateEconomicData(),
            this.updateMarketData(),
        ]);
        this.logger.log('Forced update completed');
    }
    getSchedulerStatus() {
        return {
            isRunning: !!this.economicDataTimer && !!this.marketDataTimer,
            isProduction: this.isProduction,
            nextEconomicUpdate: this.economicDataTimer
                ? new Date(Date.now() + this.updateIntervals.economic)
                : null,
            nextMarketUpdate: this.marketDataTimer
                ? new Date(Date.now() + this.updateIntervals.market)
                : null,
        };
    }
};
exports.MarketDataScheduler = MarketDataScheduler;
exports.MarketDataScheduler = MarketDataScheduler = MarketDataScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_data_service_1.FinancialDataService])
], MarketDataScheduler);
//# sourceMappingURL=market-data.scheduler.js.map