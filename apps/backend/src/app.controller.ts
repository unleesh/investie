import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
