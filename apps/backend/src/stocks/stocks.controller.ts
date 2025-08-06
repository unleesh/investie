import { Controller, Get, Param } from '@nestjs/common';
import { StocksService } from './stocks.service';
import type { StockCardData, StockSymbol } from '@investie/types';

@Controller('api/v1/stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  async getAllStocks(): Promise<StockCardData[]> {
    return await this.stocksService.getAllStocks();
  }

  @Get(':symbol')
  async getStock(@Param('symbol') symbol: StockSymbol): Promise<StockCardData | null> {
    return await this.stocksService.getStock(symbol);
  }
}
