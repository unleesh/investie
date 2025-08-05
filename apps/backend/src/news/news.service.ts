import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import type { StockSymbol, StockNewsSummary } from '@investie/types';

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

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly serpApiKey = process.env.SERPAPI_API_KEY;
  private readonly baseUrl = 'https://serpapi.com/search';
  private readonly dataDir = path.join(process.cwd(), 'data', 'news');
  private readonly openai: OpenAI | null;

  constructor() {
    // Initialize OpenAI client if API key is available
    this.openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  async getStockNews(symbol: StockSymbol): Promise<StockNewsSummary | null> {
    if (!this.serpApiKey) {
      this.logger.warn('SERPAPI_API_KEY not configured, returning null');
      return null;
    }

    try {
      const companyName = this.getCompanyName(symbol);
      const response = await axios.get<SerpApiResponse>(this.baseUrl, {
        params: {
          engine: 'google_news',
          q: `${companyName} ${symbol} stock`,
          gl: 'us',
          hl: 'en',
          api_key: this.serpApiKey,
        },
        timeout: 10000,
      });

      if (response.data.error) {
        this.logger.error(`SerpAPI error: ${response.data.error}`);
        return null;
      }

      const newsResults = response.data.news_results;
      if (!newsResults || newsResults.length === 0) {
        this.logger.warn(`No news found for ${symbol}`);
        return null;
      }

      // Use the first news article as the headline
      const topNews = newsResults[0];
      const headline = topNews.title || `Latest news for ${symbol}`;

      // Analyze sentiment using AI (Claude → OpenAI → Keyword fallback)
      const sentiment = await this.analyzeSentimentWithAI(headline);

      const newsData: StockNewsSummary = {
        headline,
        sentiment,
        source: 'google_news + claude_ai',
      };

      // Store the news data
      await this.storeNewsData(symbol, newsData, newsResults);

      return newsData;
    } catch (error) {
      this.logger.error(`Failed to fetch news for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  private getCompanyName(symbol: StockSymbol): string {
    const companyMap: Record<StockSymbol, string> = {
      AAPL: 'Apple',
      TSLA: 'Tesla',
      MSFT: 'Microsoft',
      GOOGL: 'Google Alphabet',
      AMZN: 'Amazon',
      NVDA: 'NVIDIA',
      META: 'Meta Facebook',
      NFLX: 'Netflix',
      AVGO: 'Broadcom',
      AMD: 'AMD',
    };
    return companyMap[symbol] || symbol;
  }

  private async analyzeSentimentWithAI(headline: string): Promise<'positive' | 'neutral' | 'negative'> {
    // Try Claude API first
    const claudeResult = await this.tryClaudeSentiment(headline);
    if (claudeResult) {
      this.logger.log('Sentiment analyzed with Claude AI');
      return claudeResult;
    }

    // Try OpenAI API as fallback
    const openaiResult = await this.tryOpenAISentiment(headline);
    if (openaiResult) {
      this.logger.log('Sentiment analyzed with OpenAI');
      return openaiResult;
    }

    // Use keyword fallback as last resort
    this.logger.log('Using keyword fallback for sentiment analysis');
    return this.fallbackSentiment(headline);
  }

  private async tryClaudeSentiment(headline: string): Promise<'positive' | 'neutral' | 'negative' | null> {
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    
    if (!claudeApiKey) {
      return null;
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: `Sentiment of "${headline}": positive, negative, or neutral?`
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeApiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 8000
        }
      );

      const sentiment = response.data.content[0]?.text?.trim().toLowerCase();
      
      if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
        return sentiment as 'positive' | 'negative' | 'neutral';
      }
      
      return null;
      
    } catch (error) {
      this.logger.warn('Claude API failed, trying OpenAI...');
      return null;
    }
  }

  private async tryOpenAISentiment(headline: string): Promise<'positive' | 'neutral' | 'negative' | null> {
    if (!this.openai) {
      return null;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment of this stock headline. Respond with only one word: positive, negative, or neutral.

Headline: "${headline}"`
          }
        ],
        max_tokens: 10,
        temperature: 0
      });

      const sentiment = response.choices[0]?.message?.content?.trim().toLowerCase();
      
      if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
        return sentiment as 'positive' | 'negative' | 'neutral';
      }
      
      return null;
      
    } catch (error) {
      this.logger.warn('OpenAI API failed, using keyword fallback...');
      return null;
    }
  }

  private fallbackSentiment(headline: string): 'positive' | 'neutral' | 'negative' {
    // Simple keyword fallback when Claude API is unavailable
    const positiveWords = ['up', 'rise', 'gain', 'growth', 'surge', 'strong', 'beat', 'profit'];
    const negativeWords = ['down', 'fall', 'drop', 'decline', 'loss', 'crash', 'weak', 'miss'];
    
    const lowerHeadline = headline.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerHeadline.includes(word));
    const hasNegative = negativeWords.some(word => lowerHeadline.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  private async storeNewsData(
    symbol: StockSymbol, 
    newsData: StockNewsSummary, 
    allArticles: SerpApiNewsResult[]
  ): Promise<void> {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      const timestamp = new Date().toISOString();
      const filename = `${symbol}_${timestamp.split('T')[0]}_${Date.now()}.json`;
      const filepath = path.join(this.dataDir, filename);

      const storageData = {
        symbol,
        timestamp,
        query: `${this.getCompanyName(symbol)} ${symbol} stock`,
        summary: newsData,
        allArticles: allArticles.slice(0, 10), // Store top 10 articles
        metadata: {
          totalArticles: allArticles.length,
          source: 'serpapi_google_news',
          sentimentMethodsAvailable: {
            claude: process.env.CLAUDE_API_KEY ? true : false,
            openai: process.env.OPENAI_API_KEY ? true : false,
            keyword: true
          },
          sentimentHierarchy: 'Claude → OpenAI → Keyword'
        }
      };

      fs.writeFileSync(filepath, JSON.stringify(storageData, null, 2));
      this.logger.log(`News data stored: ${filename}`);

      // Also update latest file for easy access
      const latestFile = path.join(this.dataDir, `${symbol}_latest.json`);
      fs.writeFileSync(latestFile, JSON.stringify(storageData, null, 2));

    } catch (error) {
      this.logger.error(`Failed to store news data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Method to read stored news data
  getStoredNewsData(symbol: StockSymbol): any | null {
    try {
      const latestFile = path.join(this.dataDir, `${symbol}_latest.json`);
      if (fs.existsSync(latestFile)) {
        const data = fs.readFileSync(latestFile, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to read stored news data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
}
