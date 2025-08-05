import { ConfigService } from '@nestjs/config';
export declare class FredService {
    private configService;
    private readonly logger;
    private readonly httpClient;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private getEconomicData;
    getCPI(): Promise<{
        value: number;
        date: any;
        series_id: string;
        title: string;
    }>;
    getInterestRate(): Promise<{
        value: number;
        date: any;
        series_id: string;
        title: string;
    }>;
    getUnemploymentRate(): Promise<{
        value: number;
        date: any;
        series_id: string;
        title: string;
    }>;
    getAllEconomicIndicators(): Promise<{
        cpi: {
            value: number;
            date: any;
            series_id: string;
            title: string;
        } | null;
        interestRate: {
            value: number;
            date: any;
            series_id: string;
            title: string;
        } | null;
        unemploymentRate: {
            value: number;
            date: any;
            series_id: string;
            title: string;
        } | null;
    }>;
}
