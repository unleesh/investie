import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ClaudeService } from '../services/claude.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [ChatController],
  providers: [ChatService, ClaudeService],
  exports: [ChatService],
})
export class ChatModule {}
