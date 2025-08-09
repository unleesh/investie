import { Controller, Get, Param } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { SerpApiService } from '../services/serpapi.service';
import type { StockCardData, StockSymbol } from '../types';

@Controller('api/v1/stocks')
export class StocksController {
  constructor(
    private readonly stocksService: StocksService,
    private readonly serpApiService: SerpApiService
  ) {}

  @Get()
  async getAllStocks(): Promise<StockCardData[]> {
    return await this.stocksService.getAllStocks();
  }

  @Get('debug/:symbol')
  async debugStock(@Param('symbol') symbol: StockSymbol) {
    try {
      // Direct SerpApi test
      const rawData = await this.serpApiService.getStockData(symbol, 'NASDAQ');
      
      return {
        symbol,
        timestamp: new Date().toISOString(),
        serpApiConfigured: !!process.env.SERPAPI_API_KEY,
        rawSerpApiData: rawData,
        extractedPrice: rawData?.summary?.price,
        summaryKeys: rawData?.summary ? Object.keys(rawData.summary) : [],
        debug: {
          apiKey: process.env.SERPAPI_API_KEY ? `${process.env.SERPAPI_API_KEY.slice(0, 8)}...` : 'NOT_SET',
          debugMode: process.env.DEBUG_MODE,
          environment: process.env.NODE_ENV
        }
      };
    } catch (error) {
      return {
        symbol,
        error: error.message,
        timestamp: new Date().toISOString(),
        serpApiConfigured: !!process.env.SERPAPI_API_KEY,
        debug: {
          apiKey: process.env.SERPAPI_API_KEY ? `${process.env.SERPAPI_API_KEY.slice(0, 8)}...` : 'NOT_SET',
          debugMode: process.env.DEBUG_MODE,
          environment: process.env.NODE_ENV
        }
      };
    }
  }

  @Get(':symbol')
  async getStock(@Param('symbol') symbol: StockSymbol): Promise<StockCardData | null> {
    return await this.stocksService.getStock(symbol);
  }
}
