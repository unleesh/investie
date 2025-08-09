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
    const debugMode = process.env.DEBUG_MODE === 'true';
    const startTime = Date.now();
    
    if (!this.isConfigured) {
      this.logger.warn(`[API-FIRST] SerpApi not configured for ${symbol}`);
      if (debugMode) {
        this.logger.warn(`[DEBUG] SerpApi key status: ${this.apiKey ? 'HAS_KEY' : 'NO_KEY'}`);
      }
      throw new Error(`SerpApi key required for ${symbol} stock data`);
    }

    try {
      const query = `${symbol}:${exchange}`;
      this.logger.log(`[DEBUG] Fetching stock data for ${query}`);
      
      if (debugMode) {
        this.logger.log(`[DEBUG] SerpApi request params:`, {
          engine: 'google_finance',
          api_key: `${this.apiKey.slice(0, 8)}...`,
          query: query,
          hl: 'en'
        });
      }
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: this.apiKey,
        q: query,
        hl: 'en',
      });
      
      const processingTime = Date.now() - startTime;
      if (debugMode) {
        this.logger.log(`[DEBUG] SerpApi response time: ${processingTime}ms for ${symbol}`);
        this.logger.log(`[DEBUG] SerpApi response structure:`, {
          hasResult: !!result,
          hasSummary: !!result?.summary,
          summaryKeys: result?.summary ? Object.keys(result.summary) : [],
          priceValue: result?.summary?.price,
          fullResponse: JSON.stringify(result, null, 2)
        });
        
        // Log specific data extraction attempts
        if (result?.summary) {
          this.logger.log(`[DEBUG] Price extraction attempts for ${symbol}:`, {
            summaryPrice: result.summary.price,
            summaryValue: result.summary.value,
            summaryOpen: result.summary.open,
            summaryClose: result.summary.close,
            summaryLast: result.summary.last,
            summaryPrevClose: result.summary.previous_close,
            allSummaryData: result.summary
          });
        } else {
          this.logger.error(`[DEBUG] No summary found in SerpApi response for ${symbol}`);
        }
      }

      if (!result || !result.summary) {
        this.logger.warn(`[API-FIRST] No data returned from SerpApi for ${symbol}`);
        if (debugMode) {
          this.logger.error(`[DEBUG] SerpApi empty response details:`, {
            resultExists: !!result,
            resultKeys: result ? Object.keys(result) : [],
            summaryExists: !!result?.summary,
            fullResponse: JSON.stringify(result, null, 2)
          });
        }
        throw new Error(`No stock data available for ${symbol}`);
      }

      this.logger.log(`✅ Successfully fetched stock data for ${symbol}`);
      if (debugMode) {
        this.logger.log(`[DEBUG] Final stock data for ${symbol}:`, {
          price: result?.summary?.price,
          change: result?.summary?.price_change,
          marketCap: result?.summary?.market_cap,
          volume: result?.summary?.volume,
          processingTime: `${Date.now() - startTime}ms`,
          successfulExtraction: !!(result?.summary?.price || result?.summary?.value || result?.summary?.close)
        });
      }
      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`[API-FIRST] Failed to fetch stock data for ${symbol}:`, error.message);
      if (debugMode) {
        this.logger.error(`[DEBUG] SerpApi error details:`, {
          symbol,
          error: error.message,
          stack: error.stack,
          processingTime: `${processingTime}ms`,
          apiKeyStatus: this.apiKey ? 'CONFIGURED' : 'MISSING'
        });
      }
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