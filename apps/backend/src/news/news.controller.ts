import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';

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
    validationResult?: {
      isValid: boolean;
      method: string;
      price?: number;
    };
  };
  error?: string;
  suggestions?: string[];
}

@Controller('news')
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
}