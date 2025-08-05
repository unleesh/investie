import { Injectable, Logger } from '@nestjs/common';
import type { StockCardData, StockSymbol } from '@investie/types';
import { getAllStocks, getStock } from '@investie/mock';
import { NewsService } from '../news/news.service';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(private readonly newsService: NewsService) {}

  getAllStocks(): StockCardData[] {
    // Initially, return mock data
    // Later this will integrate with Google Finance API and other services
    return getAllStocks();
  }

  async getStock(symbol: StockSymbol): Promise<StockCardData | null> {
    try {
      // Get base stock data from mock
      const stockData = getStock(symbol);
      if (!stockData) {
        return null;
      }

      // Try to get fresh news data
      const newsData = await this.newsService.getStockNews(symbol);

      // If we have fresh news, update the stock data
      if (newsData) {
        return {
          ...stockData,
          newsSummary: newsData,
        };
      }

      // Return stock data with existing mock news
      return stockData;
    } catch (error) {
      this.logger.error(
        `Failed to get stock data for ${symbol}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Fallback to mock data
      return getStock(symbol) || null;
    }
  }

  getStockSync(symbol: StockSymbol): StockCardData | null {
    // Synchronous version for backward compatibility
    const stock = getStock(symbol);
    return stock || null;
  }
}
