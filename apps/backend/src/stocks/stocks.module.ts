import { Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { SerpApiService } from '../services/serpapi.service';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [NewsModule],
  controllers: [StocksController],
  providers: [StocksService, SerpApiService],
  exports: [StocksService],
})
export class StocksModule {}
