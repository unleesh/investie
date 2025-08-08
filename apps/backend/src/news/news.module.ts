import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { ClaudeService } from '../services/claude.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [NewsController],
  providers: [NewsService, ClaudeService],
  exports: [NewsService],
})
export class NewsModule {}
