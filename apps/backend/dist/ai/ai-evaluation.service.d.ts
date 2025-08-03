import type { AIEvaluation, StockSymbol } from '@investie/types';
export declare class AIEvaluationService {
    generateEvaluation(symbol: StockSymbol): Promise<AIEvaluation>;
}
