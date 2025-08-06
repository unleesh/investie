import { OnModuleInit } from '@nestjs/common';
import { MarketDataScheduler } from './market/market-data.scheduler';
import { CacheService } from './cache/cache.service';
export declare class AppModule implements OnModuleInit {
    private marketDataScheduler;
    private cacheService;
    constructor(marketDataScheduler: MarketDataScheduler, cacheService: CacheService);
    onModuleInit(): void;
}
