import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { SerpApiService } from '../services/serpapi.service';
import { FredService } from '../services/fred.service';

@Module({
  controllers: [MarketController],
  providers: [MarketService, SerpApiService, FredService],
  exports: [MarketService],
})
export class MarketModule {}