import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('api/v1/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('stock')
  async getStockNews(@Query('symbol') symbol?: string) {
    try {
      if (!symbol) {
        throw new HttpException(
          {
            success: false,
            error: 'Missing parameter',
            message: 'Symbol query parameter is required'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.newsService.processStockNews(symbol);
      
      if (!result.isValid) {
        return {
          success: false,
          error: result.error,
          suggestions: result.suggestions || [],
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: {
          symbol: result.symbol,
          overview: result.overview,
          validation: result.validationResult
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Handle HttpExceptions properly
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch stock news',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('macro')
  async getMacroNews(@Query('date') date?: string) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid date format',
            message: 'Date must be in YYYY-MM-DD format'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const macroNews = await this.newsService.loadMacroNews(targetDate);
      
      if (!macroNews) {
        throw new HttpException(
          {
            success: false,
            error: 'No macro news found',
            message: `No macro news data available for ${targetDate}`
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: macroNews,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch macro news',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  async getHealthStatus() {
    try {
      const health = await this.newsService.healthCheck();
      
      return {
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Health check failed',
          message: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}