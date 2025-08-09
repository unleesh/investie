import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SerpApiService } from './services/serpapi.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly serpApiService: SerpApiService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/v1/health')
  getHealth(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: 'Investie Backend API - Phase 0 Foundation',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/v1/debug')
  async getDebugInfo() {
    try {
      // Test SerpApi with AAPL
      const testResult = await this.serpApiService.getStockData('AAPL', 'NASDAQ');
      
      return {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          debugMode: process.env.DEBUG_MODE,
          hasApiKeys: {
            serpApi: !!process.env.SERPAPI_API_KEY,
            claude: !!process.env.CLAUDE_API_KEY,
            fred: !!process.env.FRED_API_KEY,
          },
        },
        serpApiTest: {
          hasResult: !!testResult,
          hasSummary: !!testResult?.summary,
          extractedPrice: testResult?.summary?.extracted_price,
          priceString: testResult?.summary?.price,
          marketMovement: testResult?.summary?.market?.price_movement,
          summaryKeys: testResult?.summary ? Object.keys(testResult.summary) : [],
        },
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          debugMode: process.env.DEBUG_MODE,
          hasApiKeys: {
            serpApi: !!process.env.SERPAPI_API_KEY,
            claude: !!process.env.CLAUDE_API_KEY,
            fred: !!process.env.FRED_API_KEY,
          },
        },
      };
    }
  }
}
