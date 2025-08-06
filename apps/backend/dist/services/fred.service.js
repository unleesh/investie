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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var FredService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FredService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let FredService = FredService_1 = class FredService {
    logger = new common_1.Logger(FredService_1.name);
    httpClient;
    baseUrl = 'https://api.stlouisfed.org/fred';
    constructor() {
        this.httpClient = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 10000,
        });
    }
    async getEconomicData(seriesId, limit = 1) {
        try {
            this.logger.log(`Fetching economic data for series: ${seriesId}`);
            const response = await this.httpClient.get('/series/observations', {
                params: {
                    series_id: seriesId,
                    api_key: process.env.FRED_API_KEY,
                    file_type: 'json',
                    limit,
                    sort_order: 'desc',
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch data for ${seriesId}:`, error.message);
            throw error;
        }
    }
    async getCPI() {
        try {
            const data = await this.getEconomicData('CPIAUCSL');
            const latestObservation = data.observations?.[0];
            return {
                value: parseFloat(latestObservation?.value) || 0,
                date: latestObservation?.date,
                series_id: 'CPIAUCSL',
                title: 'Consumer Price Index for All Urban Consumers: All Items in U.S. City Average',
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch CPI data:', error.message);
            throw error;
        }
    }
    async getInterestRate() {
        try {
            const data = await this.getEconomicData('FEDFUNDS');
            const latestObservation = data.observations?.[0];
            return {
                value: parseFloat(latestObservation?.value) || 0,
                date: latestObservation?.date,
                series_id: 'FEDFUNDS',
                title: 'Federal Funds Effective Rate',
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch interest rate data:', error.message);
            throw error;
        }
    }
    async getUnemploymentRate() {
        try {
            const data = await this.getEconomicData('UNRATE');
            const latestObservation = data.observations?.[0];
            return {
                value: parseFloat(latestObservation?.value) || 0,
                date: latestObservation?.date,
                series_id: 'UNRATE',
                title: 'Unemployment Rate',
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch unemployment rate data:', error.message);
            throw error;
        }
    }
    async getAllEconomicIndicators() {
        try {
            const [cpi, interestRate, unemploymentRate] = await Promise.allSettled([
                this.getCPI(),
                this.getInterestRate(),
                this.getUnemploymentRate(),
            ]);
            return {
                cpi: cpi.status === 'fulfilled' ? cpi.value : null,
                interestRate: interestRate.status === 'fulfilled' ? interestRate.value : null,
                unemploymentRate: unemploymentRate.status === 'fulfilled' ? unemploymentRate.value : null,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch economic indicators:', error.message);
            throw error;
        }
    }
};
exports.FredService = FredService;
exports.FredService = FredService = FredService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FredService);
//# sourceMappingURL=fred.service.js.map