import { Injectable, Logger } from '@nestjs/common';
import { getJson } from 'serpapi';

@Injectable()
export class SerpApiService {
  private readonly logger = new Logger(SerpApiService.name);

  async getStockData(symbol: string, exchange: string = 'NASDAQ') {
    try {
      const query = `${symbol}:${exchange}`;
      this.logger.log(`Fetching stock data for ${query}`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: process.env.SERPAPI_API_KEY,
        q: query,
        hl: 'en',
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch stock data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getMarketIndex(symbol: string) {
    try {
      this.logger.log(`Fetching market index for ${symbol}`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: process.env.SERPAPI_API_KEY,
        q: symbol,
        hl: 'en',
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch market index for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getChartData(symbol: string, period: string = '1W', interval: string = '1d') {
    try {
      this.logger.log(`Fetching chart data for ${symbol} (${period})`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: process.env.SERPAPI_API_KEY,
        q: symbol,
        hl: 'en',
        prs: period,
        interval: interval,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch chart data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getStockNews(symbol: string) {
    try {
      this.logger.log(`Fetching news for ${symbol}`);
      
      const result = await getJson({
        engine: 'google_finance',
        api_key: process.env.SERPAPI_API_KEY,
        q: symbol,
        hl: 'en',
        gl: 'us',
      });

      return result?.news || [];
    } catch (error) {
      this.logger.error(`Failed to fetch news for ${symbol}:`, error.message);
      return [];
    }
  }
}