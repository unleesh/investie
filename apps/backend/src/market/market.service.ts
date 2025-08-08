import { Injectable, Logger } from '@nestjs/common';
import type { MarketSummaryData } from '@investie/types';
import { getMarketSummary } from '@investie/mock';
import { FinancialDataService } from './financial-data.service';
import { FearGreedService } from '../services/fear-greed.service';
import { ClaudeService } from '../services/claude.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private financialDataService: FinancialDataService,
    private fearGreedService: FearGreedService,
    private claudeService: ClaudeService,
    private cacheService: CacheService,
  ) {}

  async getSummary(): Promise<MarketSummaryData> {
    try {
      this.logger.log('Fetching enhanced market summary with AI components');
      
      const [economicData, marketData, fearGreedIndex] = await Promise.allSettled([
        this.financialDataService.getEconomicIndicators(),
        this.financialDataService.getMarketIndices(),
        this.fearGreedService.getCurrentFearGreedIndex(),
      ]);

      const economics = economicData.status === 'fulfilled' ? economicData.value : null;
      const markets = marketData.status === 'fulfilled' ? marketData.value : null;
      const fearGreed = fearGreedIndex.status === 'fulfilled' ? fearGreedIndex.value : null;

      // Transform API data to MarketSummaryData format with AI enhancements
      return this.transformToMarketSummary(economics, markets, fearGreed);
    } catch (error) {
      this.logger.error('Failed to fetch market data, falling back to mock data:', error.message);
      return getMarketSummary();
    }
  }

  private async transformToMarketSummary(
    economics: any,
    markets: any,
    fearGreedIndex?: any
  ): Promise<MarketSummaryData> {
    try {
      const mockData = getMarketSummary();

      // Generate AI outlook for interest rates
      const aiOutlook = await this.generateInterestRateOutlook(economics?.interestRate);

      return {
        fearGreedIndex: fearGreedIndex || mockData.fearGreedIndex,
        vix: {
          value: markets?.vix?.value || mockData.vix.value,
          status: markets?.vix?.status || mockData.vix.status,
          source: mockData.vix.source,
        },
        interestRate: {
          value: economics?.interestRate?.value || mockData.interestRate.value,
          aiOutlook, // Use AI-generated outlook
          source: mockData.interestRate.source,
        },
        cpi: {
          value: economics?.cpi?.value || mockData.cpi.value,
          monthOverMonth: economics?.cpi?.monthOverMonth || mockData.cpi.monthOverMonth,
          direction: economics?.cpi?.direction || mockData.cpi.direction,
          source: mockData.cpi.source,
        },
        unemploymentRate: {
          value: economics?.unemploymentRate?.value || mockData.unemploymentRate.value,
          monthOverMonth: economics?.unemploymentRate?.monthOverMonth || mockData.unemploymentRate.monthOverMonth,
          source: mockData.unemploymentRate.source,
        },
        sp500Sparkline: markets?.sp500?.sparkline || mockData.sp500Sparkline,
      };
    } catch (error) {
      this.logger.error('Failed to transform market data:', error.message);
      return getMarketSummary();
    }
  }

  private async generateInterestRateOutlook(rateData: any): Promise<string> {
    try {
      // Check cache first (12-hour TTL for AI content)
      const cacheKey = 'interest-rate-outlook';
      const cached = this.cacheService.get<string>(`ai:${cacheKey}`);
      if (cached) {
        this.logger.log('Using cached interest rate outlook');
        return cached;
      }

      const currentRate = rateData?.value || 5.33;
      const prompt = `
As a financial analyst, provide a brief outlook on Federal interest rates for retail investors.

Current Federal Funds Rate: ${currentRate}%

Consider in your analysis:
- Recent Federal Reserve policy decisions and statements
- Current inflation trends and economic indicators
- Market expectations and economic forecasts
- Impact on consumer loans, mortgages, and savings

Provide a concise, educational 1-2 sentence outlook that helps retail investors understand:
- Whether rates are likely to rise, fall, or remain stable
- The general timeframe for any expected changes
- Key factors that could influence rate decisions

Keep the language accessible and avoid technical jargon.
      `;

      const outlook = await this.claudeService.generateResponse(prompt, 200);
      
      // Cache the result
      this.cacheService.set(`ai:${cacheKey}`, outlook, 12 * 60 * 60 * 1000); // 12 hours
      
      this.logger.log('Generated AI interest rate outlook');
      return outlook;
    } catch (error) {
      this.logger.error('Failed to generate AI outlook:', error.message);
      return 'Fed rate expected to remain data-dependent with decisions based on inflation trends and economic indicators.';
    }
  }

  // Method to get enhanced market sentiment analysis
  async getMarketSentimentAnalysis(): Promise<{
    summary: MarketSummaryData;
    sentiment: {
      overall: 'bullish' | 'neutral' | 'bearish';
      analysis: string;
      keyFactors: string[];
    };
  }> {
    try {
      const summary = await this.getSummary();
      const sentimentAnalysis = await this.fearGreedService.getMarketSentimentAnalysis();
      
      const overallSentiment = this.determineOverallSentiment(summary, sentimentAnalysis.index);
      
      const prompt = `
Based on current market indicators:
- Fear & Greed Index: ${sentimentAnalysis.index.value} (${sentimentAnalysis.index.status})
- VIX: ${summary.vix.value}
- Interest Rate: ${summary.interestRate.value}%
- CPI: ${summary.cpi.value}%

Provide a brief market sentiment analysis including:
1. Overall market sentiment classification
2. 2-3 key factors driving current sentiment
3. Brief outlook for retail investors

Keep analysis educational and actionable.
      `;

      const analysis = await this.claudeService.generateResponse(prompt, 300);
      
      return {
        summary,
        sentiment: {
          overall: overallSentiment,
          analysis,
          keyFactors: sentimentAnalysis.factors,
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate sentiment analysis:', error.message);
      
      const summary = await this.getSummary();
      return {
        summary,
        sentiment: {
          overall: 'neutral',
          analysis: 'Market conditions remain mixed with balanced indicators across fear, volatility, and economic metrics.',
          keyFactors: ['Mixed economic indicators', 'Moderate market volatility', 'Balanced investor sentiment'],
        },
      };
    }
  }

  private determineOverallSentiment(
    summary: MarketSummaryData, 
    fearGreed: any
  ): 'bullish' | 'neutral' | 'bearish' {
    const scores = {
      bullish: 0,
      neutral: 0,
      bearish: 0,
    };

    // Fear & Greed Index weighting (40%)
    if (fearGreed.status === 'greed') scores.bullish += 0.4;
    else if (fearGreed.status === 'fear') scores.bearish += 0.4;
    else scores.neutral += 0.4;

    // VIX weighting (30%)
    if (summary.vix.status === 'low') scores.bullish += 0.3;
    else if (summary.vix.status === 'high') scores.bearish += 0.3;
    else scores.neutral += 0.3;

    // Economic indicators weighting (30%)
    if (summary.cpi.direction === 'down') scores.bullish += 0.15;
    else scores.bearish += 0.15;

    if (summary.unemploymentRate.monthOverMonth <= 0) scores.bullish += 0.15;
    else scores.bearish += 0.15;

    // Return highest score
    const maxScore = Math.max(scores.bullish, scores.neutral, scores.bearish);
    if (scores.bullish === maxScore) return 'bullish';
    if (scores.bearish === maxScore) return 'bearish';
    return 'neutral';
  }

  // Health check for market service
  async healthCheck(): Promise<{
    status: string;
    components: {
      financialData: string;
      fearGreed: string;
      claudeApi: string;
      cache: string;
    };
  }> {
    const [financialHealth, fearGreedHealth, claudeHealth] = await Promise.allSettled([
      Promise.resolve({ status: 'operational' }),
      this.fearGreedService.healthCheck(),
      this.claudeService.healthCheck(),
    ]);

    return {
      status: 'operational',
      components: {
        financialData: financialHealth.status === 'fulfilled' ? financialHealth.value.status : 'error',
        fearGreed: fearGreedHealth.status === 'fulfilled' ? fearGreedHealth.value.status : 'error',
        claudeApi: claudeHealth.status === 'fulfilled' ? claudeHealth.value.status : 'error',
        cache: 'operational',
      },
    };
  }

}
