import { NewsService } from './news.service';
interface ProcessNewsRequest {
    symbol: string;
}
interface ProcessNewsResponse {
    success: boolean;
    data?: {
        symbol: string;
        overview?: {
            overview: string;
            recommendation: 'BUY' | 'HOLD' | 'SELL';
            confidence: number;
            keyFactors: string[];
            riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
            timeHorizon: string;
            timestamp: string;
        };
        validationResult?: {
            isValid: boolean;
            method: string;
            price?: number;
        };
    };
    error?: string;
    suggestions?: string[];
}
export declare class NewsController {
    private readonly newsService;
    private readonly logger;
    constructor(newsService: NewsService);
    processStockNews(request: ProcessNewsRequest): Promise<ProcessNewsResponse>;
}
export {};
