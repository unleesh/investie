import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StockSymbol } from '../common/types';

@Controller('api/v1/stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  async getAllStocks() {
    try {
      const stocks = await this.stocksService.getAllStocks();
      return {
        success: true,
        data: stocks,
        timestamp: new Date().toISOString(),
        count: stocks.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch stock data',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':symbol')
  async getStock(@Param('symbol') symbol: string) {
    try {
      // Validate symbol format
      const upperSymbol = symbol.toUpperCase();
      if (!/^[A-Z]{1,5}$/.test(upperSymbol)) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid symbol format',
            message: 'Symbol must be 1-5 letters only'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const stock = await this.stocksService.getStock(upperSymbol as StockSymbol);
      
      if (!stock) {
        throw new HttpException(
          {
            success: false,
            error: 'Stock not found',
            message: `No data available for symbol ${upperSymbol}`
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: stock,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch stock data',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':symbol/chart')
  async getStockChart(
    @Param('symbol') symbol: string,
    @Query('period') period?: string
  ) {
    try {
      const upperSymbol = symbol.toUpperCase();
      const validPeriods = ['1W', '1M', '3M', '1Y'];
      const chartPeriod = period && validPeriods.includes(period.toUpperCase()) 
        ? period.toUpperCase() 
        : '1W';

      const chartData = await this.stocksService.getStockChart(
        upperSymbol as StockSymbol, 
        chartPeriod
      );

      return {
        success: true,
        data: chartData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch chart data',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}