import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { FinancialDataService } from './financial-data.service';
import { MarketDataScheduler } from './market-data.scheduler';
import { SerpApiService } from '../services/serpapi.service';
import { FredService } from '../services/fred.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [MarketController],
  providers: [
    MarketService, 
    FinancialDataService, 
    MarketDataScheduler,
    SerpApiService, 
    FredService,
  ],
  exports: [MarketService, FinancialDataService, MarketDataScheduler],
})
export class MarketModule {}
