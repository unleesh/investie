import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import type { StockSymbol, StockNewsSummary } from '@investie/types';
import { StockValidatorHelper, ValidationResult } from './stock-validator.helper';

interface SerpApiNewsResult {
  title: string;
  source: string;
  link: string;
  thumbnail?: string;
  date: string;
  snippet?: string;
}

interface SerpApiResponse {
  news_results?: SerpApiNewsResult[];
  error?: string;
}

interface MacroNewsData {
  topHeadline: string;
  articles: SerpApiNewsResult[];
  totalArticles: number;
  source: string;
  timestamp: string;
}

interface StockOverview {
  symbol: StockSymbol;
  overview: string;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence: number; // 0-100
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

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly serpApiKey = process.env.SERPAPI_API_KEY;
  private readonly baseUrl = 'https://serpapi.com/search';
  private readonly dataDir = path.join(process.cwd(), 'data', 'news');
  private readonly macroNewsDir = path.join(this.dataDir, 'macro_news');
  private readonly stockNewsDir = path.join(this.dataDir, 'stock_news');
  private readonly openai: OpenAI | null;
  private readonly stockValidator: StockValidatorHelper;

  constructor() {
    // Initialize OpenAI client if API key is available
    this.openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    
    // Initialize stock validator
    this.stockValidator = new StockValidatorHelper();
  }

  // MAIN METHOD: Complete sequential workflow as requested
  async processStockNews(inputSymbol: string): Promise<NewsProcessingResult> {
    this.logger.log(`Starting news processing workflow for: ${inputSymbol}`);

    try {
      // Step 1-2: Validate symbol using multi-tier approach
      const validationResult = await this.stockValidator.validateSymbol(inputSymbol);
      
      if (!validationResult.isValid) {
        this.logger.warn(`Symbol validation failed for ${inputSymbol}: ${validationResult.reason || validationResult.error}`);
        const suggestions = this.stockValidator.getSuggestions(inputSymbol);
        return {
          isValid: false,
          error: validationResult.reason || validationResult.error || 'Invalid symbol',
          suggestions,
          validationResult
        };
      }

      const symbol = validationResult.symbol as StockSymbol;
      const today = this.getTodayDateString();
      this.logger.log(`Symbol validated: ${symbol} (${validationResult.method})`);

      // Step 3-4: Check and load macro news
      let macroNews: MacroNewsData | null = null;
      if (!this.hasTodaysMacroNews(today)) {
        macroNews = await this.loadMacroNews(today);
        if (macroNews) {
          this.storeMacroNews(macroNews, today);
        }
      } else {
        macroNews = this.loadStoredMacroNews(today);
        this.logger.log('Using cached macro news');
      }

      // Step 4-5: Check and load stock-specific news
      let stockNews: StockNewsSummary | null = null;
      if (!this.hasTodaysStockNews(symbol, today)) {
        stockNews = await this.loadStockNews(symbol, today);
        if (stockNews) {
          this.storeStockNews(stockNews, symbol, today);
        }
      } else {
        stockNews = this.loadStoredStockNews(symbol, today);
        this.logger.log(`Using cached stock news for ${symbol}`);
      }

      // Step 5: Validate we have some news data
      if (!macroNews && !stockNews) {
        this.logger.warn(`No news data available for ${symbol}`);
        return {
          isValid: false,
          error: 'Unable to fetch news data - check API keys and network connection'
        };
      }

      // Step 6: Generate AI overview
      const overview = await this.generateOverview(symbol, stockNews, macroNews);
      
      if (overview) {
        this.storeOverview(overview, symbol, today);
        this.logger.log(`Overview generated for ${symbol}: ${overview.recommendation} (${overview.confidence}%)`);
        
        return {
          isValid: true,
          symbol,
          overview,
          validationResult
        };
      } else {
        this.logger.warn(`Failed to generate overview for ${symbol}`);
        return {
          isValid: false,
          error: 'Failed to generate investment overview'
        };
      }
      
    } catch (error) {
      this.logger.error(`Error in processStockNews for ${inputSymbol}:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      };
    }
  }

  // Helper methods
  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getMacroNewsPath(date: string): string {
    return path.join(this.macroNewsDir, date, 'macro_news.json');
  }

  private getStockNewsPath(symbol: StockSymbol, date: string): string {
    return path.join(this.stockNewsDir, symbol, date, 'stock_news.json');
  }

  private getOverviewPath(symbol: StockSymbol, date: string): string {
    return path.join(this.stockNewsDir, symbol, date, 'overview.json');
  }

  private hasTodaysMacroNews(date: string): boolean {
    const macroPath = this.getMacroNewsPath(date);
    return fs.existsSync(macroPath);
  }

  private hasTodaysStockNews(symbol: StockSymbol, date: string): boolean {
    const stockPath = this.getStockNewsPath(symbol, date);
    return fs.existsSync(stockPath);
  }

  private loadStoredMacroNews(date: string): MacroNewsData | null {
    try {
      const macroPath = this.getMacroNewsPath(date);
      if (fs.existsSync(macroPath)) {
        const data = fs.readFileSync(macroPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.error(`Failed to load macro news for ${date}:`, error instanceof Error ? error.message : 'Unknown error');
    }
    return null;
  }

  private loadStoredStockNews(symbol: StockSymbol, date: string): StockNewsSummary | null {
    try {
      const stockPath = this.getStockNewsPath(symbol, date);
      if (fs.existsSync(stockPath)) {
        const data = fs.readFileSync(stockPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.error(`Failed to load stock news for ${symbol} on ${date}:`, error instanceof Error ? error.message : 'Unknown error');
    }
    return null;
  }

  // News fetching methods
  private async loadMacroNews(date: string): Promise<MacroNewsData | null> {
    this.logger.log('Fetching macro market news...');
    
    if (!this.serpApiKey) {
      this.logger.warn('SerpAPI key not configured, skipping macro news');
      return null;
    }

    try {
      const response = await axios.get<SerpApiResponse>(this.baseUrl, {
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

      if (response.data.error) {
        this.logger.error('SerpAPI error for macro news:', response.data.error);
        return null;
      }

      const newsResults = response.data.news_results;
      if (!newsResults || newsResults.length === 0) {
        this.logger.warn('No macro news results found');
        return null;
      }

      this.logger.log(`Fetched ${newsResults.length} macro news articles`);
      
      // Store macro news data
      const topHeadline = newsResults[0].title || 'Market news';

      return {
        topHeadline,
        articles: newsResults,
        totalArticles: newsResults.length,
        source: 'serpapi_google_news',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error fetching macro news:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  private async loadStockNews(symbol: StockSymbol, date: string): Promise<StockNewsSummary | null> {
    this.logger.log(`Fetching stock news for ${symbol}...`);
    
    if (!this.serpApiKey) {
      this.logger.warn('SerpAPI key not configured, skipping stock news');
      return null;
    }

    try {
      // Company mapping for better search results
      const companyMap: Record<string, string> = {
        AAPL: 'Apple',
        TSLA: 'Tesla',
        MSFT: 'Microsoft',
        GOOGL: 'Google Alphabet',
        AMZN: 'Amazon',
        NVDA: 'NVIDIA',
        META: 'Meta Facebook',
        NFLX: 'Netflix'
      };

      const companyName = companyMap[symbol] || symbol;
      const query = `${companyName} ${symbol} stock`;

      const response = await axios.get<SerpApiResponse>(this.baseUrl, {
        params: {
          engine: 'google_news',
          q: query,
          gl: 'us',
          hl: 'en',
          num: 10,
          api_key: this.serpApiKey,
        },
        timeout: 15000,
      });

      if (response.data.error) {
        this.logger.error(`SerpAPI error for ${symbol}:`, response.data.error);
        return null;
      }

      const newsResults = response.data.news_results;
      if (!newsResults || newsResults.length === 0) {
        this.logger.warn(`No news results found for ${symbol}`);
        return null;
      }

      this.logger.log(`Fetched ${newsResults.length} news articles for ${symbol}`);
      
      // Store comprehensive news data but return summary for compatibility
      const topHeadline = newsResults[0].title || `${symbol} stock news`;
      
      // Return compatible type, but store full data separately
      return {
        headline: topHeadline,
        sentiment: 'neutral' as const, // Default sentiment, will be enhanced by AI in future
        source: 'google_news + claude_ai' as const,
        // Store articles temporarily in a property for storage method
        _fullArticles: newsResults
      } as StockNewsSummary & { _fullArticles?: SerpApiNewsResult[] };

    } catch (error) {
      this.logger.error(`Error fetching stock news for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  // AI Overview generation
  private async generateOverview(
    symbol: StockSymbol, 
    stockNews: StockNewsSummary | null, 
    macroNews: MacroNewsData | null
  ): Promise<StockOverview | null> {
    this.logger.log(`Generating overview for ${symbol}...`);

    // Try Claude first (most sophisticated)
    const claudeResult = await this.analyzeWithClaude(symbol, stockNews, macroNews);
    if (claudeResult) {
      return claudeResult;
    }

    // Fallback to OpenAI
    const openaiResult = await this.analyzeWithOpenAI(symbol, stockNews, macroNews);
    if (openaiResult) {
      return openaiResult;
    }

    // Final fallback to simple analysis
    return this.generateBasicOverview(symbol, stockNews, macroNews);
  }

  private async analyzeWithClaude(
    symbol: StockSymbol,
    stockNews: StockNewsSummary | null,
    macroNews: MacroNewsData | null
  ): Promise<StockOverview | null> {
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      this.logger.warn('Claude API key not configured');
      return null;
    }

    try {
      const prompt = this.buildAnalysisPrompt(symbol, stockNews, macroNews);

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeApiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 15000
        }
      );

      const content = response.data.content?.[0]?.text;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.overview && parsed.recommendation && parsed.confidence) {
            return {
              symbol,
              overview: parsed.overview,
              recommendation: parsed.recommendation,
              confidence: parsed.confidence,
              keyFactors: parsed.keyFactors || [],
              riskLevel: parsed.riskLevel || 'MEDIUM',
              timeHorizon: parsed.timeHorizon || '3-6 months',
              source: 'claude_ai_analysis',
              timestamp: new Date().toISOString()
            };
          }
        } catch (parseError) {
          this.logger.warn('Failed to parse Claude response as JSON');
        }
      }
    } catch (error) {
      this.logger.warn('Claude analysis failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    return null;
  }

  private async analyzeWithOpenAI(
    symbol: StockSymbol,
    stockNews: StockNewsSummary | null,
    macroNews: MacroNewsData | null
  ): Promise<StockOverview | null> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured');
      return null;
    }

    try {
      const prompt = this.buildAnalysisPrompt(symbol, stockNews, macroNews);

      // Try GPT-4.1 first, then fallback to other models
      const models = ['gpt-4-1106-preview', 'gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
      let completion;
      
      for (const model of models) {
        try {
          this.logger.log(`Attempting OpenAI analysis with model: ${model}`);
          completion = await this.openai.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 600,
            temperature: 0.2,
            response_format: { type: "json_object" }
          });
          this.logger.log(`Successfully used OpenAI model: ${model}`);
          break;
        } catch (modelError) {
          this.logger.warn(`Model ${model} failed, trying next:`, modelError instanceof Error ? modelError.message : 'Unknown error');
          continue;
        }
      }
      
      if (!completion) {
        throw new Error('All OpenAI models failed');
      }

      const content = completion.choices[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.overview && parsed.recommendation && parsed.confidence) {
            return {
              symbol,
              overview: parsed.overview,
              recommendation: parsed.recommendation,
              confidence: parsed.confidence,
              keyFactors: parsed.keyFactors || [],
              riskLevel: parsed.riskLevel || 'MEDIUM',
              timeHorizon: parsed.timeHorizon || '3-6 months',
              source: 'openai_analysis',
              timestamp: new Date().toISOString()
            };
          }
        } catch (parseError) {
          this.logger.warn('Failed to parse OpenAI response as JSON');
        }
      }
    } catch (error) {
      this.logger.warn('OpenAI analysis failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    return null;
  }

  private buildAnalysisPrompt(
    symbol: StockSymbol,
    stockNews: StockNewsSummary | null,
    macroNews: MacroNewsData | null
  ): string {
    // Build a comprehensive news analysis prompt
    let prompt = `Analyze ${symbol} stock for investment recommendation based on the following news data:\n\n`;
    
    if (stockNews) {
      prompt += `COMPANY-SPECIFIC NEWS:\n`;
      prompt += `- Headline: ${stockNews.headline}\n`;
      prompt += `- Source: ${stockNews.source}\n`;
      
      // Check if we have additional articles stored
      const stockNewsWithArticles = stockNews as StockNewsSummary & { _fullArticles?: SerpApiNewsResult[] };
      if (stockNewsWithArticles._fullArticles && stockNewsWithArticles._fullArticles.length > 1) {
        prompt += `- Additional Headlines:\n`;
        stockNewsWithArticles._fullArticles.slice(1, 6).forEach((article, index) => {
          prompt += `  ${index + 2}. ${article.title}\n`;
        });
      }
      prompt += '\n';
    }
    
    if (macroNews && macroNews.articles && macroNews.articles.length > 0) {
      prompt += `MARKET & ECONOMIC NEWS:\n`;
      prompt += `- Top Headline: ${macroNews.topHeadline}\n`;
      prompt += `- Additional Headlines:\n`;
      
      // Include top 3-5 macro news headlines for context
      macroNews.articles.slice(0, 5).forEach((article, index) => {
        prompt += `  ${index + 1}. ${article.title}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `Based on this news analysis, provide an investment assessment for ${symbol} in the following JSON format:
{
  "overview": "2-3 sentence analysis of the stock's outlook based on the news",
  "recommendation": "BUY|HOLD|SELL",
  "confidence": 1-100,
  "keyFactors": ["factor1", "factor2", "factor3"],
  "riskLevel": "LOW|MEDIUM|HIGH",
  "timeHorizon": "1-3 months|3-6 months|6-12 months"
}

Focus on:
- Company performance indicators from news
- Market conditions and economic factors
- Industry trends
- Risk factors mentioned in news
- Growth opportunities or concerns`;

    return prompt;
  }

  private generateBasicOverview(
    symbol: StockSymbol,
    stockNews: StockNewsSummary | null,
    macroNews: MacroNewsData | null
  ): StockOverview {
    // Final fallback when all AI services fail
    // Provide neutral, data-driven analysis without template keywords
    
    const keyFactors: string[] = [];
    let confidence = 50; // Neutral confidence when AI fails
    
    // Assess data availability objectively
    if (stockNews?.headline) {
      keyFactors.push('Company-specific news data available');
      confidence += 10;
    } else {
      keyFactors.push('Limited company-specific information');
      confidence -= 5;
    }
    
    if (macroNews?.articles && macroNews.articles.length > 0) {
      keyFactors.push('Market environment data available');
      confidence += 5;
    } else {
      keyFactors.push('Limited market context');
    }
    
    // Conservative approach when AI analysis unavailable
    keyFactors.push('AI analysis unavailable - conservative assessment');
    
    return {
      symbol,
      overview: `Unable to perform AI-powered analysis for ${symbol}. Based on available news data, recommend conducting manual research before making investment decisions. ${stockNews ? 'Company news is available for review.' : 'Limited company-specific news available.'} ${macroNews ? 'Market context data is available for analysis.' : 'Limited broader market context.'}`,
      recommendation: 'HOLD', // Conservative default
      confidence: Math.max(30, Math.min(confidence, 70)), // Keep conservative range
      keyFactors,
      riskLevel: 'MEDIUM',
      timeHorizon: '3-6 months',
      source: 'fallback_data_analysis',
      timestamp: new Date().toISOString()
    };
  }

  // Storage methods
  private storeMacroNews(macroNews: MacroNewsData, date: string): void {
    try {
      const macroDir = path.join(this.macroNewsDir, date);
      this.ensureDirectoryExists(macroDir);
      const macroPath = this.getMacroNewsPath(date);
      
      const storeData = {
        date,
        timestamp: macroNews.timestamp,
        query: 'stock market economy finance business',
        topHeadline: macroNews.topHeadline,
        totalArticles: macroNews.totalArticles,
        articles: macroNews.articles,
        metadata: {
          source: macroNews.source,
          cached: false
        }
      };

      fs.writeFileSync(macroPath, JSON.stringify(storeData, null, 2));
      this.logger.log(`Macro news stored: ${macroPath}`);
    } catch (error) {
      this.logger.error('Failed to store macro news:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private storeStockNews(stockNews: StockNewsSummary, symbol: StockSymbol, date: string): void {
    try {
      const stockDir = path.join(this.stockNewsDir, symbol, date);
      this.ensureDirectoryExists(stockDir);
      const stockPath = this.getStockNewsPath(symbol, date);
      
      // Check if full articles are available
      const stockNewsWithArticles = stockNews as StockNewsSummary & { _fullArticles?: SerpApiNewsResult[] };
      const fullArticles = stockNewsWithArticles._fullArticles;
      
      const storeData = {
        symbol,
        date,
        timestamp: new Date().toISOString(),
        query: `${symbol} stock`,
        summary: {
          headline: stockNews.headline,
          source: stockNews.source
        },
        // Include full articles if available
        ...(fullArticles && {
          articles: fullArticles,
          totalArticles: fullArticles.length
        }),
        metadata: {
          source: stockNews.source,
          cached: false
        }
      };

      fs.writeFileSync(stockPath, JSON.stringify(storeData, null, 2));
      this.logger.log(`Stock news stored: ${stockPath}`);
    } catch (error) {
      this.logger.error(`Failed to store stock news for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private storeOverview(overview: StockOverview, symbol: StockSymbol, date: string): void {
    try {
      const stockDir = path.join(this.stockNewsDir, symbol, date);
      this.ensureDirectoryExists(stockDir);
      const overviewPath = this.getOverviewPath(symbol, date);
      
      const storeData = {
        symbol: overview.symbol,
        overview: overview.overview,
        recommendation: overview.recommendation,
        confidence: overview.confidence,
        keyFactors: overview.keyFactors,
        riskLevel: overview.riskLevel,
        timeHorizon: overview.timeHorizon,
        source: overview.source,
        timestamp: overview.timestamp,
        date,
        metadata: {
          generatedAt: overview.timestamp,
          testMode: false
        }
      };

      fs.writeFileSync(overviewPath, JSON.stringify(storeData, null, 2));
      this.logger.log(`Overview stored: ${overviewPath}`);
    } catch (error) {
      this.logger.error(`Failed to store overview for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
