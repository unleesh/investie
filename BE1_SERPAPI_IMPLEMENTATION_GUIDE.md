# BE1 SerpApi Google Finance 구현 가이드

## 개요
이 문서는 SerpApi를 이용하여 Google Finance 데이터를 통합하는 BE1 (Financial Data) 구현 가이드입니다.

## 필요한 API Keys 및 설정

### 1. API Keys
- **FRED API Key**: 경제 지표 데이터 (CPI, Interest Rate, Unemployment)
- **SerpApi Key**: Google Finance 데이터 (주식 가격, VIX, S&P500)
  - 제공된 키: `8c078329b04057f671dbe708facfe8c3d58955f68407bab792b09f46cc8f6ca4`
- **Claude API Key**: AI 평가 및 채팅 (선택사항, BE1과 직접 관련 없음)

### 2. 환경 설정
```bash
# apps/backend/.env 파일이 생성되어 있음
SERPAPI_API_KEY=8c078329b04057f671dbe708facfe8c3d58955f68407bab792b09f46cc8f6ca4
FRED_API_KEY=c8fe579bd8af12c6d2debebedc700fec
```

## 설치된 패키지들

backend/package.json에 다음 패키지들이 추가되었습니다:
- `@nestjs/axios`: HTTP 요청 처리
- `@nestjs/config`: 환경변수 관리
- `@nestjs/schedule`: 크론 작업 스케줄링
- `@nestjs/cache-manager`: 캐시 관리
- `axios`: HTTP 클라이언트
- `cache-manager` + `cache-manager-redis-store`: Redis 캐싱
- `ioredis`: Redis 클라이언트
- `serpapi`: SerpApi 공식 SDK

## SerpApi Google Finance API 사용법

### 1. 기본 구조
```typescript
import { getJson } from 'serpapi';

const results = await getJson({
  engine: "google_finance",
  api_key: process.env.SERPAPI_API_KEY,
  // 검색 파라미터들...
});
```

### 2. 주요 엔드포인트별 파라미터

#### 개별 주식 데이터
```typescript
// AAPL 주식 정보
const stockData = await getJson({
  engine: "google_finance",
  api_key: process.env.SERPAPI_API_KEY,
  q: "AAPL:NASDAQ",
  hl: "en"
});
```

#### 시장 개요 데이터
```typescript
// S&P 500 지수
const sp500Data = await getJson({
  engine: "google_finance",
  api_key: process.env.SERPAPI_API_KEY,
  q: ".INX:INDEXSP",
  hl: "en"
});

// VIX 지수
const vixData = await getJson({
  engine: "google_finance",
  api_key: process.env.SERPAPI_API_KEY,
  q: "VIX:INDEXCBOE",
  hl: "en"
});
```

#### 차트 데이터 (시계열)
```typescript
// 1주일 차트 데이터
const chartData = await getJson({
  engine: "google_finance",
  api_key: process.env.SERPAPI_API_KEY,
  q: "AAPL:NASDAQ",
  hl: "en",
  interval: "1d",
  period: "1W"
});
```

## 구현 단계별 가이드

### Step 1: Configuration Module 설정
```typescript
// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class ConfigurationModule {}
```

### Step 2: SerpApi Service 생성
```typescript
// src/services/serpapi.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getJson } from 'serpapi';

@Injectable()
export class SerpApiService {
  constructor(private configService: ConfigService) {}

  async getStockData(symbol: string, exchange: string = 'NASDAQ') {
    return await getJson({
      engine: "google_finance",
      api_key: this.configService.get('SERPAPI_API_KEY'),
      q: `${symbol}:${exchange}`,
      hl: "en"
    });
  }

  async getMarketIndex(symbol: string) {
    return await getJson({
      engine: "google_finance", 
      api_key: this.configService.get('SERPAPI_API_KEY'),
      q: symbol,
      hl: "en"
    });
  }

  async getChartData(symbol: string, period: string = '1W', interval: string = '1d') {
    return await getJson({
      engine: "google_finance",
      api_key: this.configService.get('SERPAPI_API_KEY'),
      q: symbol,
      hl: "en",
      interval,
      period
    });
  }
}
```

### Step 3: FRED API Service 생성
```typescript
// src/services/fred.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FredService {
  private readonly baseUrl = 'https://api.stlouisfed.org/fred';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getEconomicData(seriesId: string) {
    const url = `${this.baseUrl}/series/observations`;
    const params = {
      series_id: seriesId,
      api_key: this.configService.get('FRED_API_KEY'),
      file_type: 'json',
      limit: 1,
      sort_order: 'desc'
    };

    const response = await firstValueFrom(
      this.httpService.get(url, { params })
    );
    return response.data;
  }

  // CPI (Consumer Price Index)
  async getCPI() {
    return this.getEconomicData('CPIAUCSL');
  }

  // Federal Funds Rate (Interest Rate)
  async getInterestRate() {
    return this.getEconomicData('FEDFUNDS');
  }

  // Unemployment Rate
  async getUnemploymentRate() {
    return this.getEconomicData('UNRATE');
  }
}
```

### Step 4: Market Service 업데이트
```typescript
// src/market/market.service.ts
import { Injectable } from '@nestjs/common';
import type { MarketSummaryData } from '@investie/types';
import { getMarketSummary } from '@investie/mock';
import { SerpApiService } from '../services/serpapi.service';
import { FredService } from '../services/fred.service';

@Injectable()
export class MarketService {
  constructor(
    private serpApiService: SerpApiService,
    private fredService: FredService,
  ) {}

  async getSummary(): Promise<MarketSummaryData> {
    try {
      // 실제 API 호출
      const [sp500Data, vixData, cpiData, interestRateData, unemploymentData] = await Promise.allSettled([
        this.serpApiService.getMarketIndex('.INX:INDEXSP'),
        this.serpApiService.getMarketIndex('VIX:INDEXCBOE'),
        this.fredService.getCPI(),
        this.fredService.getInterestRate(),
        this.fredService.getUnemploymentRate(),
      ]);

      // 데이터 변환 및 처리 로직
      return this.transformToMarketSummary({
        sp500Data,
        vixData,
        cpiData,
        interestRateData,
        unemploymentData,
      });
    } catch (error) {
      console.error('Market data fetch failed, using mock data:', error);
      // Fallback to mock data
      return getMarketSummary();
    }
  }

  private transformToMarketSummary(data: any): MarketSummaryData {
    // API 응답을 MarketSummaryData 타입으로 변환하는 로직
    // 구현 필요
  }
}
```

### Step 5: Stocks Service 업데이트
```typescript
// src/stocks/stocks.service.ts
import { Injectable } from '@nestjs/common';
import type { StockCardData, StockSymbol } from '@investie/types';
import { getAllStocks, getStock } from '@investie/mock';
import { SerpApiService } from '../services/serpapi.service';

@Injectable()
export class StocksService {
  constructor(private serpApiService: SerpApiService) {}

  async getAllStocks(): Promise<StockCardData[]> {
    const symbols: StockSymbol[] = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'AVGO', 'AMD'];
    
    try {
      const stockPromises = symbols.map(symbol => this.getStockData(symbol));
      const stocks = await Promise.allSettled(stockPromises);
      
      return stocks
        .filter((result): result is PromiseFulfilledResult<StockCardData | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
    } catch (error) {
      console.error('Failed to fetch all stocks, using mock data:', error);
      return getAllStocks();
    }
  }

  async getStock(symbol: StockSymbol): Promise<StockCardData | null> {
    try {
      return await this.getStockData(symbol);
    } catch (error) {
      console.error(`Failed to fetch ${symbol}, using mock data:`, error);
      return getStock(symbol);
    }
  }

  private async getStockData(symbol: StockSymbol): Promise<StockCardData | null> {
    const stockData = await this.serpApiService.getStockData(symbol);
    // SerpApi 응답을 StockCardData 타입으로 변환하는 로직 구현 필요
    return this.transformToStockCardData(stockData, symbol);
  }

  private transformToStockCardData(data: any, symbol: StockSymbol): StockCardData {
    // API 응답을 StockCardData 타입으로 변환하는 로직
    // 구현 필요
  }
}
```

## 개발 순서

1. **환경 설정 완료** ✅
2. **패키지 설치**: `cd apps/backend && npm install`
3. **Configuration Module 구성**
4. **SerpApi Service 구현**
5. **FRED Service 구현**  
6. **Market Service 실제 API 통합**
7. **Stocks Service 실제 API 통합**
8. **캐시 레이어 추가**
9. **에러 핸들링 및 fallback 로직 강화**
10. **테스트 작성**

## API Rate Limits 주의사항

### SerpApi 제한사항
- 월 100회 무료 검색
- 초당 최대 5회 요청
- 실제 운영 시 유료 플랜 필요

### FRED API 제한사항  
- 일일 120,000 요청
- 무료 사용 가능

## 다음 단계

이 가이드를 바탕으로 실제 구현을 시작할 수 있습니다. 각 서비스의 `transform` 메서드는 SerpApi와 FRED API의 실제 응답 구조를 파악한 후 구현해야 합니다.