import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { ClaudeService } from '../ai/claude.service';
import { StockValidatorHelper } from './stock-validator.helper';
import {
  NewsProcessingResult,
  StockSymbol,
  MacroNewsData,
  StockNewsSummary,
  StockOverview,
  SerpApiNewsResult
} from '../common/types';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly serpApiKey = process.env.SERPAPI_API_KEY;
  private readonly dataDir = path.join(process.cwd(), 'data', 'news');
  private readonly macroNewsDir = path.join(this.dataDir, 'macro_news');
  private readonly stockNewsDir = path.join(this.dataDir, 'stock_news');
  private readonly stockValidator: StockValidatorHelper;

  constructor(
    private readonly claudeService: ClaudeService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.stockValidator = new StockValidatorHelper();
    this.ensureDirectoryExists(this.dataDir);
    this.ensureDirectoryExists(this.macroNewsDir);
    this.ensureDirectoryExists(this.stockNewsDir);
  }

  async processStockNews(inputSymbol: string): Promise<NewsProcessingResult> {
    try {
      // Step 1-2: Multi-tier symbol validation
      const validationResult = await this.stockValidator.validateSymbol(inputSymbol);
      if (!validationResult.isValid) {
        return {
          isValid: false,
          error: validationResult.reason,
          suggestions: this.stockValidator.getSuggestions(inputSymbol)
        };
      }

      const symbol = validationResult.symbol as StockSymbol;
      const today = this.getTodayDateString();

      // Step 3-4: Load or fetch macro market news
      let macroNews: MacroNewsData | null = null;
      if (!this.hasTodaysMacroNews(today)) {
        macroNews = await this.loadMacroNews(today);
        if (macroNews) this.storeMacroNews(macroNews, today);
      } else {
        macroNews = this.loadStoredMacroNews(today);
      }

      // Step 5: Load or fetch stock-specific news
      let stockNews: StockNewsSummary | null = null;
      if (!this.hasTodaysStockNews(symbol, today)) {
        stockNews = await this.loadStockNews(symbol, today);
        if (stockNews) this.storeStockNews(stockNews, symbol, today);
      } else {
        stockNews = this.loadStoredStockNews(symbol, today);
      }

      // Step 6: Generate comprehensive AI overview
      const overview = await this.generateOverview(symbol, stockNews, macroNews);
      if (overview) {
        this.storeOverview(overview, symbol, today);
        return { isValid: true, symbol, overview, validationResult };
      }

      return { isValid: false, error: 'Failed to generate investment overview' };
    } catch (error) {
      this.logger.error(`News processing failed for ${inputSymbol}: ${error.message}`);
      return { isValid: false, error: 'Internal processing error' };
    }
  }

  async loadMacroNews(date: string): Promise<MacroNewsData | null> {
    if (!this.serpApiKey) {
      this.logger.warn('SerpAPI key not configured, using mock data');
      return this.getMockMacroNews();
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_news',
          q: 'stock market economy finance business',
          gl: 'us',
          hl: 'en',
          num: 75,
          api_key: this.serpApiKey,
        },
        timeout: 15000,
      });

      const newsResults = response.data.news_results;
      if (!newsResults?.length) return null;

      return {
        topHeadline: newsResults[0].title || 'Market news',
        articles: newsResults,
        totalArticles: newsResults.length,
        source: 'serpapi_google_news',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to load macro news: ${error.message}`);
      return this.getMockMacroNews();
    }
  }

  async loadStockNews(symbol: StockSymbol, date: string): Promise<StockNewsSummary | null> {
    if (!this.serpApiKey) {
      this.logger.warn('SerpAPI key not configured, using mock data');
      return this.getMockStockNews(symbol);
    }

    try {
      // Company name mapping for better search results
      const companyMap: Record<string, string> = {
        AAPL: 'Apple', TSLA: 'Tesla', MSFT: 'Microsoft', GOOGL: 'Google Alphabet',
        AMZN: 'Amazon', NVDA: 'NVIDIA', META: 'Meta Facebook', NFLX: 'Netflix'
      };

      const companyName = companyMap[symbol] || symbol;
      const query = `${companyName} ${symbol} stock`;

      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_news',
          q: query,
          gl: 'us', hl: 'en', num: 10,
          api_key: this.serpApiKey,
        },
        timeout: 15000,
      });

      const newsResults = response.data.news_results;
      if (!newsResults?.length) return null;

      const topHeadline = newsResults[0].title || `${symbol} stock news`;
      const sentiment = await this.analyzeSentiment(topHeadline, newsResults.slice(0, 3));

      return {
        headline: topHeadline,
        sentiment,
        source: 'google_news + claude_ai',
      };
    } catch (error) {
      this.logger.error(`Failed to load stock news for ${symbol}: ${error.message}`);
      return this.getMockStockNews(symbol);
    }
  }

  async generateOverview(symbol: StockSymbol, stockNews: StockNewsSummary | null, macroNews: MacroNewsData | null): Promise<StockOverview | null> {
    // Try Claude AI first (most sophisticated)
    const claudeResult = await this.analyzeWithClaude(symbol, stockNews, macroNews);
    if (claudeResult) return claudeResult;

    // Final fallback to rule-based analysis
    return this.generateBasicOverview(symbol, stockNews, macroNews);
  }

  async analyzeSentiment(headline: string, articles: SerpApiNewsResult[]): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      // Check cache first (6-hour TTL)
      const cacheKey = `sentiment:${Buffer.from(headline).toString('base64').slice(0, 20)}`;
      const cached = await this.cacheManager.get<'positive' | 'neutral' | 'negative'>(cacheKey);
      if (cached) return cached;

      // Build comprehensive sentiment analysis prompt
      const articlesText = articles.map(article => `${article.title}: ${article.snippet || ''}`).join('\n');

      const sentimentPrompt = `
Analyze the sentiment of these financial news headlines and content:

Main Headline: ${headline}

Additional Articles:
${articlesText}

Classify the overall sentiment as positive, neutral, or negative based on:
- Market impact implications
- Company performance indicators  
- Investor sentiment tone
- Economic implications
- Risk factors mentioned

Consider the financial context and potential impact on stock price.

Respond with only one word: positive, neutral, or negative
      `;

      // Try Claude AI first
      const response = await this.claudeService.generateResponse(sentimentPrompt, 50);
      const sentiment = this.parseSentimentResponse(response);

      // Cache and return result (6 hours)
      await this.cacheManager.set(cacheKey, sentiment, 21600000);
      return sentiment;
    } catch (error) {
      // Fallback to keyword-based analysis
      return this.getKeywordBasedSentiment(headline);
    }
  }

  async healthCheck(): Promise<{
    status: string;
    serpApiConfigured: boolean;
    claudeConfigured: boolean;
    openaiConfigured: boolean;
  }> {
    const claudeHealth = await this.claudeService.healthCheck();
    
    return {
      status: 'operational',
      serpApiConfigured: !!this.serpApiKey,
      claudeConfigured: claudeHealth.hasApiKey,
      openaiConfigured: false, // OpenAI not implemented yet
    };
  }

  // Private helper methods
  private async analyzeWithClaude(symbol: StockSymbol, stockNews: StockNewsSummary | null, macroNews: MacroNewsData | null): Promise<StockOverview | null> {
    try {
      const prompt = this.buildAnalysisPrompt(symbol, stockNews, macroNews);
      const schema = `{
        "overview": "2-3 sentence analysis of the stock's outlook based on the news",
        "recommendation": "BUY|HOLD|SELL",
        "confidence": 85,
        "keyFactors": ["factor1", "factor2", "factor3"],
        "riskLevel": "LOW|MEDIUM|HIGH",
        "timeHorizon": "1-3 months|3-6 months|6-12 months"
      }`;

      const response = await this.claudeService.generateStructuredResponse<any>(prompt, schema);

      return {
        symbol,
        overview: response.overview || `Analysis for ${symbol}`,
        recommendation: response.recommendation || 'HOLD',
        confidence: response.confidence || 70,
        keyFactors: response.keyFactors || ['Market conditions', 'Company fundamentals'],
        riskLevel: response.riskLevel || 'MEDIUM',
        timeHorizon: response.timeHorizon || '3-6 months',
        source: 'claude_ai_analysis',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Claude analysis failed for ${symbol}: ${error.message}`);
      return null;
    }
  }

  private buildAnalysisPrompt(symbol: StockSymbol, stockNews: StockNewsSummary | null, macroNews: MacroNewsData | null): string {
    let prompt = `Analyze ${symbol} stock for investment recommendation based on the following news data:\n\n`;

    if (stockNews) {
      prompt += `COMPANY-SPECIFIC NEWS:\n- Headline: ${stockNews.headline}\n- Source: ${stockNews.source}\n`;
    }

    if (macroNews?.articles && macroNews.articles.length > 0) {
      prompt += `MARKET & ECONOMIC NEWS:\n- Top Headline: ${macroNews.topHeadline}\n`;
      macroNews.articles.slice(0, 5).forEach((article, index) => {
        prompt += `  ${index + 1}. ${article.title}\n`;
      });
    }

    return prompt + `
Based on this news analysis, provide an investment assessment for ${symbol} in JSON format:

Focus on:
- Company performance indicators from news
- Market conditions and economic factors
- Industry trends
- Risk factors mentioned in news
- Growth opportunities or concerns`;
  }

  private generateBasicOverview(symbol: StockSymbol, stockNews: StockNewsSummary | null, macroNews: MacroNewsData | null): StockOverview {
    const keyFactors: string[] = [];
    let confidence = 50;

    if (stockNews?.headline) {
      keyFactors.push('Company-specific news data available');
      confidence += 10;
    }

    if (macroNews?.articles && macroNews.articles.length > 0) {
      keyFactors.push('Market news context available');
      confidence += 5;
    }

    keyFactors.push('Technical analysis pending', 'Fundamental review needed');

    return {
      symbol,
      recommendation: 'HOLD',
      confidence: Math.max(30, Math.min(confidence, 70)),
      overview: `Unable to perform AI-powered analysis for ${symbol}. Recommend manual research.`,
      keyFactors,
      riskLevel: 'MEDIUM',
      timeHorizon: '3-6 months',
      source: 'fallback_data_analysis',
      timestamp: new Date().toISOString()
    };
  }

  private parseSentimentResponse(response: string): 'positive' | 'neutral' | 'negative' {
    const text = response.toLowerCase().trim();
    if (text.includes('positive')) return 'positive';
    if (text.includes('negative')) return 'negative';
    return 'neutral';
  }

  private getKeywordBasedSentiment(headline: string): 'positive' | 'neutral' | 'negative' {
    const text = headline.toLowerCase();

    const positiveWords = ['growth', 'gains', 'surge', 'rally', 'bullish', 'beat', 'strong', 'up', 'rise'];
    const negativeWords = ['decline', 'fall', 'crash', 'bearish', 'miss', 'weak', 'down', 'loss'];

    const positiveScore = positiveWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
    const negativeScore = negativeWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  // File system helper methods
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private hasTodaysMacroNews(date: string): boolean {
    const macroPath = path.join(this.macroNewsDir, date, 'macro_news.json');
    return fs.existsSync(macroPath);
  }

  private hasTodaysStockNews(symbol: StockSymbol, date: string): boolean {
    const stockPath = path.join(this.stockNewsDir, symbol, date, 'stock_news.json');
    return fs.existsSync(stockPath);
  }

  private storeMacroNews(macroNews: MacroNewsData, date: string): void {
    const macroDir = path.join(this.macroNewsDir, date);
    this.ensureDirectoryExists(macroDir);

    const storeData = {
      date, timestamp: macroNews.timestamp,
      query: 'stock market economy finance business',
      topHeadline: macroNews.topHeadline,
      totalArticles: macroNews.totalArticles,
      articles: macroNews.articles,
      metadata: { source: macroNews.source, cached: false }
    };

    fs.writeFileSync(path.join(macroDir, 'macro_news.json'), JSON.stringify(storeData, null, 2));
  }

  private storeStockNews(stockNews: StockNewsSummary, symbol: StockSymbol, date: string): void {
    const stockDir = path.join(this.stockNewsDir, symbol, date);
    this.ensureDirectoryExists(stockDir);

    const storeData = {
      symbol, date, timestamp: new Date().toISOString(),
      query: `${symbol} stock`,
      summary: { headline: stockNews.headline, source: stockNews.source },
      metadata: { source: stockNews.source, cached: false }
    };

    fs.writeFileSync(path.join(stockDir, 'stock_news.json'), JSON.stringify(storeData, null, 2));
  }

  private storeOverview(overview: StockOverview, symbol: StockSymbol, date: string): void {
    const stockDir = path.join(this.stockNewsDir, symbol, date);
    this.ensureDirectoryExists(stockDir);
    fs.writeFileSync(path.join(stockDir, 'overview.json'), JSON.stringify(overview, null, 2));
  }

  private loadStoredMacroNews(date: string): MacroNewsData | null {
    try {
      const macroPath = path.join(this.macroNewsDir, date, 'macro_news.json');
      const data = JSON.parse(fs.readFileSync(macroPath, 'utf8'));
      return {
        topHeadline: data.topHeadline,
        articles: data.articles,
        totalArticles: data.totalArticles,
        source: data.source,
        timestamp: data.timestamp
      };
    } catch (error) {
      return null;
    }
  }

  private loadStoredStockNews(symbol: StockSymbol, date: string): StockNewsSummary | null {
    try {
      const stockPath = path.join(this.stockNewsDir, symbol, date, 'stock_news.json');
      const data = JSON.parse(fs.readFileSync(stockPath, 'utf8'));
      return {
        headline: data.summary.headline,
        sentiment: 'neutral', // Would be stored/calculated
        source: data.summary.source
      };
    } catch (error) {
      return null;
    }
  }

  // Mock data methods
  private getMockMacroNews(): MacroNewsData {
    return {
      topHeadline: 'Markets show mixed signals amid economic uncertainty',
      articles: [
        {
          title: 'Markets show mixed signals amid economic uncertainty',
          link: 'https://example.com/news1',
          snippet: 'Economic indicators suggest cautious optimism',
          date: new Date().toISOString(),
          source: 'MockNews'
        }
      ],
      totalArticles: 1,
      source: 'mock_data',
      timestamp: new Date().toISOString()
    };
  }

  private getMockStockNews(symbol: StockSymbol): StockNewsSummary {
    const mockHeadlines: Record<string, string> = {
      'AAPL': 'Apple reports strong quarterly earnings with Services growth',
      'TSLA': 'Tesla expands charging network amid EV competition',
      'NVDA': 'NVIDIA sees continued AI chip demand growth',
      'GOOGL': 'Google Cloud revenue acceleration continues',
      'MSFT': 'Microsoft Azure gains market share in cloud computing'
    };

    return {
      headline: mockHeadlines[symbol] || `${symbol} company updates`,
      sentiment: 'neutral',
      source: 'mock_data'
    };
  }
}