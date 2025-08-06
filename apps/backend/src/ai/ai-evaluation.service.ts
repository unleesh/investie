import { Injectable } from '@nestjs/common';
import type { AIEvaluation, StockSymbol } from '@investie/types';

@Injectable()
export class AIEvaluationService {
  async generateEvaluation(symbol: StockSymbol): Promise<AIEvaluation> {
    // Initially, return mock data
    // Later integrate with Claude API for real-time AI evaluations
    const mockEvaluation: AIEvaluation = {
      summary: `AI evaluation for ${symbol} will be generated using Claude API in Phase 1.`,
      rating: 'neutral',
      confidence: 75,
      keyFactors: [
        'Market conditions',
        'Financial metrics',
        'Industry trends',
        'Technical indicators',
      ],
      timeframe: '3M',
      source: 'claude_ai',
      lastUpdated: new Date().toISOString(),
    };

    return mockEvaluation;
  }
}
