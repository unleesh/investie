import { Injectable, Logger } from '@nestjs/common';
import { getJson } from 'serpapi';

@Injectable()
export class SerpApiService {
  private readonly logger = new Logger(SerpApiService.name);
  private readonly apiKey: string;
  private readonly isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || '';
    this.isConfigured = !!this.apiKey;
    
    if (!this.isConfigured) {
      this.logger.warn('SerpApi key not configured - using fallback data');
    } else {
      this.logger.log('SerpApi service initialized with API key');
    }
  }

  async getStockData(symbol: string, exchange: string = 'NASDAQ') {
    if (!this.isConfigured) {
      this.logger.warn(`[API-FIRST] SerpApi not configured for ${symbol}`);
      throw new Error(`SerpApi key required for ${symbol} stock data`);
    }

    try {
      const query = `${symbol}:${exchange}`;
      this.logger.log(`Fetching stock data for ${query}`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: this.apiKey,
        q: query,
        hl: 'en',
      });

      if (!result || !result.summary) {
        this.logger.warn(`[API-FIRST] No data returned from SerpApi for ${symbol}`);
        throw new Error(`No stock data available for ${symbol}`);
      }

      this.logger.log(`Successfully fetched stock data for ${symbol}`);
      return result;
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to fetch stock data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getMarketIndex(symbol: string) {
    if (!this.isConfigured) {
      this.logger.warn(`[API-FIRST] SerpApi not configured for market index ${symbol}`);
      throw new Error(`SerpApi key required for ${symbol} market data`);
    }

    try {
      this.logger.log(`Fetching market index for ${symbol}`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: this.apiKey,
        q: symbol,
        hl: 'en',
      });

      if (!result || !result.summary) {
        this.logger.warn(`[API-FIRST] No market index data for ${symbol}`);
        throw new Error(`No market index data available for ${symbol}`);
      }

      this.logger.log(`Successfully fetched market index for ${symbol}`);
      return result;
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to fetch market index for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getChartData(symbol: string, period: string = '1W', interval: string = '1d') {
    if (!this.isConfigured) {
      this.logger.warn(`[API-FIRST] SerpApi not configured for chart data ${symbol}`);
      throw new Error(`SerpApi key required for ${symbol} chart data`);
    }

    try {
      this.logger.log(`Fetching chart data for ${symbol} (${period})`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: this.apiKey,
        q: symbol,
        hl: 'en',
        prs: period,
        interval: interval,
      });

      if (!result || !result.chart) {
        this.logger.warn(`[API-FIRST] No chart data for ${symbol}`);
        throw new Error(`No chart data available for ${symbol}`);
      }

      this.logger.log(`Successfully fetched chart data for ${symbol}`);
      return result;
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to fetch chart data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getStockNews(symbol: string) {
    if (!this.isConfigured) {
      this.logger.warn(`[API-FIRST] SerpApi not configured for news ${symbol}`);
      return []; // Return empty array instead of fallback news
    }

    try {
      this.logger.log(`Fetching news for ${symbol}`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: this.apiKey,
        q: symbol,
        hl: 'en',
        gl: 'us',
      });

      if (!result || !result.news) {
        this.logger.warn(`[API-FIRST] No news data for ${symbol}`);
        return []; // Return empty array instead of fallback
      }

      this.logger.log(`Successfully fetched news for ${symbol}`);
      return result.news || [];
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to fetch news for ${symbol}:`, error.message);
      return []; // Return empty array instead of fallback
    }
  }

  // API-first architecture - no fallback methods

  // Health check for API-first architecture
  async healthCheck(): Promise<{ status: string; hasApiKey: boolean }> {
    return {
      status: this.isConfigured ? 'operational' : 'api_key_required',
      hasApiKey: this.isConfigured,
    };
  }
}