import type { StockSymbol } from '@investie/types';
import { ValidationResult } from './stock-validator.helper';
interface StockOverview {
    symbol: StockSymbol;
    overview: string;
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    confidence: number;
    keyFactors: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    timeHorizon: '1-3 months' | '3-6 months' | '6-12 months';
    source: string;
    timestamp: string;
}
interface NewsProcessingResult {
    isValid: boolean;
    symbol?: string;
    overview?: StockOverview;
    error?: string;
    suggestions?: string[];
    validationResult?: ValidationResult;
}
export declare class NewsService {
    private readonly logger;
    private readonly serpApiKey;
    private readonly baseUrl;
    private readonly dataDir;
    private readonly macroNewsDir;
    private readonly stockNewsDir;
    private readonly openai;
    private readonly stockValidator;
    constructor();
    processStockNews(inputSymbol: string): Promise<NewsProcessingResult>;
    private getTodayDateString;
    private ensureDirectoryExists;
    private getMacroNewsPath;
    private getStockNewsPath;
    private getOverviewPath;
    private hasTodaysMacroNews;
    private hasTodaysStockNews;
    private loadStoredMacroNews;
    private loadStoredStockNews;
    private loadMacroNews;
    private loadStockNews;
    private generateOverview;
    private analyzeWithClaude;
    private analyzeWithOpenAI;
    private buildAnalysisPrompt;
    private generateBasicOverview;
    private storeMacroNews;
    private storeStockNews;
    private storeOverview;
}
export {};
