import { Controller, Post, Get, Body, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';

interface NewsArticle {
  title: string;
  link: string;
  snippet?: string;
  date: string;
  source: string;
}

interface ProcessNewsRequest {
  symbol: string;
}

interface ProcessNewsResponse {
  success: boolean;
  data?: {
    symbol: string;
    overview?: {
      overview: string;
      recommendation: 'BUY' | 'HOLD' | 'SELL';
      confidence: number;
      keyFactors: string[];
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      timeHorizon: string;
      timestamp: string;
    };
    stockNews?: {
      headline: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      articles: NewsArticle[];
    };
    macroNews?: {
      topHeadline: string;
      articles: NewsArticle[];
      totalArticles: number;
    };
    validationResult?: {
      isValid: boolean;
      method: string;
      price?: number;
    };
  };
  error?: string;
  suggestions?: string[];
}

interface NewsResponse {
  symbol: string;
  overview?: {
    overview: string;
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    confidence: number;
    keyFactors: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    timeHorizon: string;
    timestamp: string;
  };
  stockNews?: {
    headline: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    articles: NewsArticle[];
  };
  macroNews?: {
    topHeadline: string;
    articles: NewsArticle[];
    totalArticles: number;
  };
  validationResult?: {
    isValid: boolean;
    method: string;
    price?: number;
  };
  timestamp: string;
}

@Controller('api/v1/news')
export class NewsController {
  private readonly logger = new Logger(NewsController.name);

  constructor(private readonly newsService: NewsService) {}

  @Post('process')
  async processStockNews(@Body() request: ProcessNewsRequest): Promise<ProcessNewsResponse> {
    this.logger.log(`Processing news request for symbol: ${request.symbol}`);

    try {
      // Validate request
      if (!request.symbol || typeof request.symbol !== 'string') {
        throw new HttpException('Symbol is required and must be a string', HttpStatus.BAD_REQUEST);
      }

      const symbol = request.symbol.trim();
      if (!symbol) {
        throw new HttpException('Symbol cannot be empty', HttpStatus.BAD_REQUEST);
      }

      // Process the stock news using the complete workflow
      const result = await this.newsService.processStockNews(symbol);

      if (!result.isValid) {
        // Return error with suggestions if symbol is invalid
        return {
          success: false,
          error: result.error,
          suggestions: result.suggestions
        };
      }

      // Return success response
      return {
        success: true,
        data: {
          symbol: result.symbol!,
          overview: result.overview,
          stockNews: result.stockNews,
          macroNews: result.macroNews,
          validationResult: result.validationResult
        }
      };

    } catch (error) {
      this.logger.error(`Error processing news for symbol ${request.symbol}:`, error instanceof Error ? error.message : 'Unknown error');
      
      throw new HttpException(
        `Failed to process news: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':symbol')
  async getStockNews(@Param('symbol') symbol: string): Promise<NewsResponse> {
    this.logger.log(`Getting news data for symbol: ${symbol}`);

    try {
      if (!symbol || typeof symbol !== 'string') {
        throw new HttpException('Symbol is required', HttpStatus.BAD_REQUEST);
      }

      const cleanSymbol = symbol.trim().toUpperCase();
      if (!cleanSymbol) {
        throw new HttpException('Symbol cannot be empty', HttpStatus.BAD_REQUEST);
      }

      // Process the stock news to get comprehensive data
      const result = await this.newsService.processStockNews(cleanSymbol);

      if (!result.isValid) {
        throw new HttpException(
          result.error || 'Invalid symbol or unable to fetch news',
          HttpStatus.NOT_FOUND
        );
      }

      return {
        symbol: result.symbol!,
        overview: result.overview,
        stockNews: result.stockNews,
        macroNews: result.macroNews,
        validationResult: result.validationResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Error getting news for symbol ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Failed to get news: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('macro/today')
  async getTodayMacroNews() {
    this.logger.log('Getting today\'s macro news');

    try {
      // Use a placeholder symbol to trigger macro news fetching
      await this.newsService.processStockNews('AAPL');
      
      return {
        success: true,
        message: 'Macro news processing initiated. Check data directory for results.',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error getting macro news:', error instanceof Error ? error.message : 'Unknown error');
      
      throw new HttpException(
        `Failed to get macro news: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}