import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketModule } from './market/market.module';
import { StocksModule } from './stocks/stocks.module';
import { ChatModule } from './chat/chat.module';
import { CacheModule } from './cache/cache.module';
import { MarketDataScheduler } from './market/market-data.scheduler';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [CacheModule, MarketModule, StocksModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private marketDataScheduler: MarketDataScheduler,
    private cacheService: CacheService,
  ) {}

  onModuleInit() {
    // Start the market data scheduler
    this.marketDataScheduler.startScheduler();
    
    // Start the cache cleanup timer
    this.cacheService.startCleanupTimer();
  }
}
