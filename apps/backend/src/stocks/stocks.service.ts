import { Injectable } from '@nestjs/common';
import type { StockCardData, StockSymbol } from '@investie/types';
import { getAllStocks, getStock } from '@investie/mock';

@Injectable()
export class StocksService {
  getAllStocks(): StockCardData[] {
    // Initially, return mock data
    // Later this will integrate with Google Finance API and other services
    return getAllStocks();
  }

  getStock(symbol: StockSymbol): StockCardData | null {
    // Initially, return mock data
    // Later this will integrate with real-time data APIs
    const stock = getStock(symbol);
    return stock || null;
  }
}