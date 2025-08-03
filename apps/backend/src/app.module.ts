import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketModule } from './market/market.module';
import { StocksModule } from './stocks/stocks.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [MarketModule, StocksModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
