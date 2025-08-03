Investie Phase 0: 프로젝트 리더 준비 가이드 (📱 모바일 + 🌐 웹)
🎯 목표
프론트엔드 및 백엔드 엔지니어 모두에게 **React Native (모바일 앱)**와 **Next.js 14 (반응형 웹)**를 나란히 구동할 수 있는 단일 모노레포(monorepo) 뼈대를 제공하는 것입니다. 이 구조는 타입, 목업 데이터, 유틸리티를 공유하여 4명의 개발자가 첫날부터 병렬로 개발을 시작할 수 있도록 합니다.

📂 0. 모노레포 구조 (Monorepo Layout)
Nx 워크스페이스를 기반으로 프로젝트 구조를 설정합니다. 이는 코드 재사용성을 극대화하고 일관성을 유지하는 핵심입니다.

investie/
├── apps/
│   ├── mobile/        # React-Native (Expo) 애플리케이션
│   ├── web/           # Next.js 14 애플리케이션
│   └── backend/       # NestJS API 서버
├── packages/
│   ├── types/         # 공유 TypeScript 타입 (계약서)
│   ├── mock/          # 공유 목업 데이터 (JSON 파일)
│   └── utils/         # 공유 헬퍼 함수 (빈 껍데기)
└── package.json       # 루트 스크립트 및 의존성 관리

🧬 1. 공유 패키지 설정
1.1. packages/types (공유 타입 정의)
프론트엔드와 백엔드 간의 "단일 진실 공급원 (Single Source of Truth)" 역할을 합니다. 새로운 필드가 필요하면, 반드시 이 타입 파일에 먼저 Pull Request를 생성해야 합니다.

TypeScript

// packages/types/src/index.ts

// API 및 제네릭 타입
export type Status = 'low' | 'medium' | 'high' | 'fear' | 'neutral' | 'greed' | 'oversold' | 'overbought';
export type Trend = 'up' | 'down' | 'flat';

// 시장 요약 카드 타입
export interface MarketSummaryData {
  fearGreedIndex: { value: number; status: 'fear' | 'neutral' | 'greed' };
  vix: { value: number; status: 'low' | 'medium' | 'high' };
  interestRate: { value: number; aiOutlook: string };
  cpi: { value: number; monthOverMonth: number; direction: 'up' | 'down' };
  unemploymentRate: { value: number; monthOverMonth: number };
  sp500Sparkline: { data: number[]; weeklyTrend: 'up' | 'down' | 'flat' };
}

// 개별 주식 카드 타입
export type StockSymbol = 'AAPL' | 'TSLA' | 'MSFT' | 'GOOGL' | 'AMZN' | 'NVDA' | 'META' | 'NFLX' | 'AVGO' | 'AMD';

// 주가 차트 타입
export interface StockPricePoint {
  timestamp: string; // ISO 날짜 문자열
  price: number;
  volume?: number;
}

export interface StockPriceChart {
  period: '1D' | '1W' | '1M' | '3M' | '1Y';
  data: StockPricePoint[];
  trend: 'up' | 'down' | 'flat';
  change: number;
  changePercent: number;
  source: 'google_finance';
}

// AI 종합평가 타입
export interface AIEvaluation {
  summary: string; // 2-3문장의 종합적인 AI 분석
  rating: 'bullish' | 'neutral' | 'bearish';
  confidence: number; // 0-100 신뢰도 점수
  keyFactors: string[]; // 평가에 영향을 미치는 3-4개 주요 요인
  timeframe: '1W' | '1M' | '3M'; // 평가 시간 범위
  source: 'claude_ai';
  lastUpdated: string; // ISO 타임스탬프
}

export interface StockCardData {
  symbol: StockSymbol;
  name: string;
  price: { current: number; change: number; changePercent: number };
  priceChart: StockPriceChart; // 주가 그래프 데이터
  fundamentals: { pe: number; marketCap: number; volume: number; fiftyTwoWeekHigh: number; fiftyTwoWeekLow: number };
  technicals: { rsi: number; rsiStatus: 'oversold' | 'neutral' | 'overbought' };
  aiEvaluation: AIEvaluation; // 새로 추가: 뉴스 이전에 표시되는 AI 종합평가
  newsSummary: { headline: string; sentiment: 'positive' | 'neutral' | 'negative' };
  sectorPerformance: { name: string; weeklyChange: number };
}

// AI 챗봇 타입
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: 'market' | 'stock' | 'general';
  relatedSymbol?: StockSymbol;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  isActive: boolean;
  lastActivity: string;
}

export interface ChatbotState {
  isOpen: boolean;
  isLoading: boolean;
  currentSession: ChatSession | null;
  recentSessions: ChatSession[];
}

// 사용자 인증 타입
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'google' | 'facebook' | 'github' | 'email';
  createdAt: string;
  lastLoginAt: string;
}

// 관심종목 관리 타입
export interface WatchlistItem {
  symbol: StockSymbol;
  addedAt: string;
  customName?: string; // 사용자 정의 종목명
  order: number; // 목록 내 순서
}

export interface Watchlist {
  userId: string;
  items: WatchlistItem[];
  maxItems: number; // 최대 종목 수 (기본 10개)
  lastUpdated: string;
}

1.2. packages/mock (목업 데이터)
Phase 0 동안 두 프론트엔드 앱에 데이터를 제공할 작은 JSON 파일들입니다.

packages/mock/src/market-summary.json

JSON

{
  "fearGreedIndex": { "value": 38, "status": "fear" },
  "vix": { "value": 17.5, "status": "medium" },
  "interestRate": { "value": 5.33, "aiOutlook": "연준은 다음 분기까지 금리를 동결할 것으로 예상됩니다." },
  "cpi": { "value": 3.4, "monthOverMonth": 0.1, "direction": "up" },
  "unemploymentRate": { "value": 3.9, "monthOverMonth": 0.1 },
  "sp500Sparkline": { "data": [4780, 4785, 4790, 4770, 4795, 4805, 4800], "weeklyTrend": "up" }
}
packages/mock/src/stocks.json

JSON

{
  "AAPL": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": { "current": 195.89, "change": 2.34, "changePercent": 1.21 },
    "priceChart": {
      "period": "1W",
      "data": [
        { "timestamp": "2025-01-27T16:00:00Z", "price": 192.45 },
        { "timestamp": "2025-01-28T16:00:00Z", "price": 193.21 },
        { "timestamp": "2025-01-29T16:00:00Z", "price": 191.78 },
        { "timestamp": "2025-01-30T16:00:00Z", "price": 194.12 },
        { "timestamp": "2025-01-31T16:00:00Z", "price": 193.55 },
        { "timestamp": "2025-02-03T16:00:00Z", "price": 195.89 }
      ],
      "trend": "up",
      "change": 3.44,
      "changePercent": 1.79,
      "source": "google_finance"
    },
    "fundamentals": { "pe": 28.5, "marketCap": 3050000000000, "volume": 45680000, "fiftyTwoWeekHigh": 199.62, "fiftyTwoWeekLow": 164.08 },
    "technicals": { "rsi": 62, "rsiStatus": "neutral" },
    "aiEvaluation": {
      "summary": "애플은 강력한 기본기와 서비스 수익 확장으로 견실한 성장을 유지하고 있습니다. 비전 프로는 초기 공급 제약에도 불구하고 중요한 혁신 촉매제 역할을 하고 있습니다. 아이폰 수요는 안정화되고 있으며 2분기 업그레이드 사이클 모멘텀이 구축되고 있습니다.",
      "rating": "bullish",
      "confidence": 85,
      "keyFactors": ["서비스 수익 증가", "비전 프로 시장 잠재력", "아이폰 업그레이드 사이클", "강력한 현금 포지션"],
      "timeframe": "3M",
      "source": "claude_ai",
      "lastUpdated": "2025-02-03T10:30:00Z"
    },
    "newsSummary": { "headline": "분석가들은 비전 프로 판매 전망에 대해 여전히 긍정적입니다.", "sentiment": "positive" },
    "sectorPerformance": { "name": "Technology", "weeklyChange": 2.1 }
  }
  // ... 나머지 9개 주식에 대한 목업 데이터 추가 (각각 priceChart 필드 포함)
}

1.3. packages/utils (유틸리티 함수 껍데기)
로직은 비어있고 컴파일만 가능한 상태로, 포매팅 함수 등의 뼈대를 미리 정의합니다.

TypeScript

// packages/utils/src/formatters.ts
export const formatCurrency = (value: number) => { /* TODO */ };
export const formatPercentage = (value: number) => { /* TODO */ };


🏗️ 2. 애플리케이션 뼈대(스켈레톤) 구성
2.1. 프론트엔드 (Mobile + Web)
모바일과 웹 앱 모두 동일한 컴포넌트 API를 갖도록 뼈대를 구성하여 코드 공유의 기반을 마련합니다.

🔹 React-Native (apps/mobile)
TypeScript

// apps/mobile/src/components/ui/Card.tsx
import { View } from 'react-native';
export const Card = ({ children }) => <View>{children}</View>;

// apps/mobile/src/components/charts/LineChart.tsx
import { View, Text } from 'react-native';
export const LineChart = () => <View><Text>Line Chart Stub</Text></View>;

// apps/mobile/src/components/charts/StockPriceChart.tsx
import { View, Text } from 'react-native';
export const StockPriceChart = ({ data }) => <View><Text>Stock Price Chart Stub</Text></View>;

// apps/mobile/src/components/ai/AIEvaluationCard.tsx
import { View, Text } from 'react-native';
export const AIEvaluationCard = ({ evaluation }) => <View><Text>AI Evaluation Stub</Text></View>;

// apps/mobile/src/components/ai/AIChatbot.tsx
import { View, Text } from 'react-native';
export const AIChatbot = () => <View><Text>AI Chatbot Stub</Text></View>;
🔸 Next.js (apps/web)
Next.js 14의 App Router를 사용합니다. 컴포넌트 API는 모바일과 동일하게 유지합니다.

TypeScript

// apps/web/src/components/ui/Card.tsx
export const Card = ({ children }) => <div>{children}</div>;

// apps/web/src/components/charts/LineChart.tsx
export const LineChart = () => <div>Line Chart Stub</div>;

// apps/web/src/components/charts/StockPriceChart.tsx
export const StockPriceChart = ({ data }) => <div>Stock Price Chart Stub</div>;

// apps/web/src/components/ai/AIEvaluationCard.tsx
export const AIEvaluationCard = ({ evaluation }) => <div>AI Evaluation Stub</div>;

// apps/web/src/components/ai/AIChatbot.tsx (오른쪽 사이드바에 위치)
export const AIChatbot = () => <div>AI Chatbot Stub</div>;

// apps/web/app/page.tsx
import { MarketSummaryCard } from '@/components/cards/MarketSummaryCard'; // 예시

export default function Home() {
  return (
    <main>
      <h1>Hello Investie Web</h1>
      {/* <MarketSummaryCard /> */}
    </main>
  );
}


2.2. 백엔드 (apps/backend)
NestJS 서비스와 컨트롤러 뼈대를 생성합니다. 초기에는 목업 데이터를 반환합니다.

TypeScript

// apps/backend/src/market/market.service.ts
import { Injectable } from '@nestjs/common';
import * as marketSummaryMock from '@investie/mock/src/market-summary.json';
import * as stocksMock from '@investie/mock/src/stocks.json';
import { MarketSummaryData, StockCardData, StockSymbol } from '@investie/types';

@Injectable()
export class MockDataService {
  getMarketSummary(): MarketSummaryData {
    return marketSummaryMock;
  }
  getStock(symbol: StockSymbol): StockCardData {
    return stocksMock[symbol];
  }
}


🚀 3. 개발자 스크립트
루트 package.json에서 한 번의 명령어로 모든 개발 환경을 시작할 수 있도록 설정합니다.

JSON

{
  "scripts": {
    "dev": "concurrently \"npm:dev:mobile\" \"npm:dev:web\" \"npm:dev:backend\"",
    "dev:mobile": "nx run mobile:start",
    "dev:web": "nx run web:dev",
    "dev:backend": "nx run backend:start:dev",
    "typecheck": "tsc -b"
  }
}


✅ 4. Phase 0 완료 체크리스트
모든 항목이 체크되어야 Phase 1 태스크 보드로 넘어갈 수 있습니다.

[ ] packages/types가 tsc -p packages/types 명령어로 컴파일됩니다.

[ ] npm run dev 명령어가 Expo, Next.js, NestJS 백엔드를 오류 없이 동시에 실행합니다.

[ ] 모바일 앱이 시뮬레이터에서 "Hello Investie Mobile" 플레이스홀더를 표시합니다.

[ ] 웹 홈페이지(http://localhost:3001)가 "Hello Investie Web" 플레이스홀더를 표시합니다.

[ ] 백엔드 엔드포인트 /api/v1/market-summary 와 /api/v1/stocks/AAPL이 200 OK 와 함께 목업 JSON을 반환합니다.

[ ] 모든 뼈대 컴포넌트/서비스가 올바르게 export되어 ESLint 검사를 통과합니다.

[ ] 모든 개발자가 레포지토리를 클론하고, npm install 및 npm run dev를 성공적으로 완료했습니다.

## 🎉 현재 구현 상태 (최신 업데이트)

### ✅ 백엔드 구현 완료
**Phase 0 ➜ Phase 1 ➜ Phase 2 - 완전 구현 완료**

#### BE1 (금융 데이터) - ✅ 완료
- ✅ FRED API 통합 FinancialDataService (CPI, 금리, 실업률)
- ✅ Google Finance API 통합 (VIX, S&P500 데이터)  
- ✅ 주기적 업데이트를 위한 MarketDataScheduler
- ✅ Redis 캐싱 전략 (경제 지표 24시간 캐시)
- ✅ getStockBySymbol 메서드를 가진 StocksService
- ✅ 주식 차트 데이터를 위한 HistoricalDataService (1D, 1W, 1M, 3M, 1Y)
- ✅ 주식 데이터 5분 캐시, 차트 데이터 1시간 캐시
- ✅ 완전한 API 엔드포인트: `/api/v1/stocks/:symbol`, `/api/v1/stocks`

#### BE2 (뉴스 & AI) - ✅ 완료
- ✅ Claude Search API를 사용한 AiContentService (공포 & 탐욕 지수)
- ✅ 금리 AI 전망을 위한 Claude API 통합
- ✅ 종합적인 주식 분석을 위한 AIEvaluationService
- ✅ Google News + Claude API 통합 NewsService
- ✅ RSI 계산 및 기술적 분석
- ✅ 세션 관리 및 컨텍스트 인식을 가진 ChatService  
- ✅ 완전한 채팅 API 엔드포인트: `/api/v1/chat/sessions/*`
- ✅ Redis 캐싱 전략: AI 콘텐츠 12시간, 뉴스 6시간, 채팅 1시간

#### 통합 백엔드 아키텍처 - ✅ 완료
- ✅ StocksService에서 BE1 + BE2 데이터 통합
- ✅ AI 강화 공포 & 탐욕 지수가 포함된 시장 요약
- ✅ AI 평가 + 뉴스 + RSI + 가격 차트가 포함된 주식 카드
- ✅ 목업 데이터를 사용한 완전한 대체 시스템
- ✅ 모든 서비스에 걸친 종합적인 캐싱
- ✅ 모든 10개 대상 주식 (AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META, NFLX, AVGO, AMD)

### 🔧 사용 가능한 API 엔드포인트
```bash
# 핵심 시장 데이터 (AI 강화)
GET /api/v1/market-summary     # AI 공포 & 탐욕 + 금리 전망이 포함된 시장 데이터

# 주식 데이터 (완전 통합)  
GET /api/v1/stocks             # 완전한 BE1+BE2 데이터를 포함한 모든 10개 주식
GET /api/v1/stocks/:symbol     # AI 평가 + 뉴스 + RSI가 포함된 개별 주식
GET /api/v1/stocks/:symbol/chart?period=1W  # 과거 차트 데이터

# AI 챗봇 시스템
POST /api/v1/chat/sessions     # 새 채팅 세션 생성
POST /api/v1/chat/sessions/:id/messages  # AI에 메시지 전송
GET  /api/v1/chat/sessions/:id # 세션 기록 가져오기
GET  /api/v1/chat/sessions     # 최근 세션 목록
DELETE /api/v1/chat/sessions/:id  # 세션 종료

# 건강 상태 및 상태
GET /api/v1/health             # 백엔드 건강 상태 확인
GET /api/v1/chat/health        # 채팅 서비스 건강 상태
```

### 🗂️ 현재 데이터 구조 (완전 구현)
모든 목업 데이터는 완전한 BE1 + BE2 필드를 포함합니다:
- ✅ 시장 요약: 실시간 공포 & 탐욕 + AI 금리 전망
- ✅ 주식 카드: 가격 차트 + AI 평가 + 뉴스 요약 + RSI
- ✅ 채팅 시스템: 세션 기반 AI 투자 어시스턴트

### 📋 프론트엔드 개발 준비 완료
BE1과 BE2가 완료되어 프론트엔드 개발자들은 이제:
1. 실제 AI 강화 데이터로 MarketSummaryCard 구축
2. 통합된 가격 차트와 AI 평가가 포함된 StockCard 컴포넌트 생성  
3. AI 챗봇 인터페이스 구현 (웹 사이드바, 모바일 모달)
4. 백엔드 API 개발을 기다리지 않고 UI/UX에 집중
5. 라이브 백엔드 엔드포인트 사용 또는 종합적인 목업 데이터로 대체

### 🔑 프로덕션 요구사항
완전한 AI 기능을 위해 다음 API 키를 설정하세요:
```bash
CLAUDE_API_KEY=your-claude-api-key
GOOGLE_NEWS_API_KEY=your-news-api-key  
GOOGLE_FINANCE_API_KEY=your-finance-api-key
FRED_API_KEY=your-fred-api-key
```

### 🆕 신규 기능 요구사항 (Phase 3)

#### 사용자 인증 시스템
- **로그인 방식**: Google, Facebook, GitHub 소셜 로그인
- **인증 상태**: JWT 토큰 기반 세션 관리
- **사용자 프로필**: 기본 정보 및 설정 관리

#### 관심종목 관리 시스템
- **기본 종목**: 로그인하지 않은 사용자는 기본 10개 종목 (AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META, NFLX, AVGO, AMD)
- **맞춤 관심종목**: 로그인한 사용자는 개인 관심종목 목록 관리
- **관리 기능**: 종목 추가/삭제/순서 변경
- **최대 종목 수**: 10개 (기본값, 향후 확장 가능)

#### UI 배치 사양
**데스크톱 레이아웃 (1024px+):**
```
┌─────────────────────┬─────────────────────┐
│                     │  WATCHLIST          │
│                     │  ┌───────────────┐   │
│   MAIN CONTENT      │  │ [+ Add Stock] │   │
│   ┌─────────────┐   │  │ ○ AAPL       │   │
│   │Market Summary│   │  │ ○ TSLA       │   │
│   └─────────────┘   │  │ ○ MSFT   [x] │   │
│   ┌─────────────┐   │  └───────────────┘   │
│   │Stock Card 1 │   │                     │
│   │ - Chart     │   │   AI CHATBOT        │
│   │ - AI Eval   │   │   ┌─────────────┐   │
│   │ - News      │   │   │ Chat Header │   │
│   └─────────────┘   │   ├─────────────┤   │
│   ┌─────────────┐   │   │  Messages   │   │
│   │Stock Card 2 │   │   │  Area       │   │
│   └─────────────┘   │   └─────────────┘   │
└─────────────────────┴─────────────────────┘
```

**모바일 레이아웃:**
- **관심종목**: 헤더 영역의 드롭다운 또는 서랍 메뉴
- **AI 챗봇**: 플로팅 버튼으로 모달/바텀 시트 호출
- **종목 목록**: 세로 스크롤 카드 목록

#### API 엔드포인트 (신규 추가 예정)
```bash
# 인증 시스템
POST /api/v1/auth/login      # 소셜 로그인
POST /api/v1/auth/logout     # 로그아웃
GET  /api/v1/auth/profile    # 사용자 프로필

# 관심종목 관리
GET    /api/v1/user/watchlist     # 사용자 관심종목 목록
POST   /api/v1/user/watchlist     # 종목 추가
DELETE /api/v1/user/watchlist/:symbol  # 종목 삭제
PUT    /api/v1/user/watchlist/order    # 순서 변경
```

#### 의존성 고려사항
- **메인 화면 업데이트**: 사용자 로그인 상태에 따라 기본 10개 종목 또는 사용자 관심종목 표시
- **실시간 동기화**: 관심종목 변경 시 메인 화면 자동 업데이트
- **상태 관리**: 전역 상태로 사용자 인증 상태 및 관심종목 목록 관리
- **캐싱 전략**: 사용자별 관심종목 캐싱 (1시간 TTL)

ℹ️ Phase 1 계획을 위한 참고사항
코드 공유: 차트 및 UI 컴포넌트 API는 모바일과 웹에서 동일하므로, Phase 1에서 점진적으로 packages/ui로 추출할 수 있습니다.

스타일링: Tailwind 설정은 공유됩니다. 모바일은 NativeWind를, 웹은 Tailwind CSS 3를 사용합니다.

반응형 디자인: 데스크톱, 태블릿, 모바일 웹이 동일한 레이아웃 기본 요소를 재사용하도록 useBreakpoint 같은 헬퍼를 조기에 도입하는 것이 좋습니다.