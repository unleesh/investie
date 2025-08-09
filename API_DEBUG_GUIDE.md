# API 디버깅 가이드 (API Debugging Guide)

실시간 API 데이터 vs Mock 데이터 사용 여부를 확인하고 디버깅하는 방법을 설명합니다.

## 🔍 현재 상황 분석

### API 키 설정 상태 ✅
- **FRED API Key**: `d149f5d6b66c553db42971ea72bfcf2a` (설정됨)
- **SerpApi Key**: `44846dcc63c0adae1f023980952d7fe8ca7987e60a9e68ac9e63b2b29500d00e` (설정됨)  
- **Claude API Key**: `sk-ant-api03-QBhdRWxaFfXyttgIPF45qr...` (설정됨)

### API 호출 흐름
1. **Frontend** → `http://localhost:3001/live`
2. **API 호출** → `http://localhost:3002/api/v1/market-summary`
3. **Backend Services**:
   - `FinancialDataService` → FRED API (경제 지표)
   - `SerpApiService` → Google Finance (주식 데이터)
   - `FearGreedService` → Fear & Greed Index
   - `ClaudeService` → AI 분석

### 문제점 확인
백엔드가 실제 API를 호출하지만 **실패 시 자동으로 Mock 데이터로 폴백**하고 있습니다.

## 🚀 실시간 디버깅 방법

### 1. 백엔드 로그 모니터링

```bash
# 백엔드 로그 실시간 모니터링
cd /Users/seinoh/Desktop/github/investie/apps/backend
npm run start:dev

# 또는 기존 프로세스 로그 확인
tail -f /tmp/backend.log
```

### 2. API 호출 상태 직접 확인

```bash
# 백엔드 헬스 체크
curl -s http://localhost:3002/api/v1/health | jq

# 마켓 서머리 API 테스트
curl -s http://localhost:3002/api/v1/market-summary | jq

# 개별 주식 데이터 테스트
curl -s http://localhost:3002/api/v1/stocks/AAPL | jq
```

### 3. 외부 API 직접 테스트

```bash
# FRED API 테스트 (CPI 데이터)
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=d149f5d6b66c553db42971ea72bfcf2a&file_type=json&limit=1&sort_order=desc" | jq

# FRED API 테스트 (금리 데이터)  
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=d149f5d6b66c553db42971ea72bfcf2a&file_type=json&limit=1&sort_order=desc" | jq

# FRED API 테스트 (실업률 데이터)
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=d149f5d6b66c553db42971ea72bfcf2a&file_type=json&limit=1&sort_order=desc" | jq
```

### 4. 디버그 모드 활성화

백엔드에 환경변수 추가:
```bash
# .env 파일에 추가
DEBUG_MODE=true
LOG_LEVEL=debug
API_CALL_LOGGING=true
```

## 🔧 디버그 모드 구현

### Frontend Debug 로깅 활성화

`apps/web/.env.local`에 추가:
```env
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### 실시간 API 호출 추적

Frontend 컴포넌트에서 API 호출 상태 확인:

```typescript
// 디버그 정보 표시
const debugInfo = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  marketData: marketData,
  isFromMock: marketData?.fearGreedIndex?.value === 40, // Mock 데이터 식별
  lastUpdated: new Date().toISOString()
};

console.log('🔍 API Debug Info:', debugInfo);
```

## 📊 실시간 데이터 vs Mock 데이터 구분법

### Mock 데이터 식별 방법
1. **Fear & Greed Index**: Mock = `40`, 실제 API = 다양한 값
2. **VIX 값**: Mock = `19.45`, 실제 API = 실시간 변동값
3. **SP500 Sparkline**: Mock = `[]` (빈 배열), 실제 API = 데이터 존재
4. **CPI 값**: Mock = `3.2%`, 실제 API = 최신 정부 발표 수치

### 로그에서 확인할 키워드
- ✅ **"Fetching fresh economic indicators from FRED API"** → 실제 API 호출
- ✅ **"Retrieved economic indicators from cache"** → 캐시된 실제 데이터
- ⚠️ **"Failed to fetch market data, falling back to mock data"** → Mock 데이터 사용
- ⚠️ **"Using mock data fallback"** → API 실패로 인한 Mock 사용

## 🛠 문제 해결 단계

### 단계 1: API 키 유효성 검증
```bash
# FRED API 키 테스트
curl -s "https://api.stlouisfed.org/fred/series?series_id=CPIAUCSL&api_key=YOUR_FRED_KEY&file_type=json"

# 성공 시 JSON 응답, 실패 시 에러 메시지 확인
```

### 단계 2: 백엔드 캐시 클리어
```bash
# Redis 캐시 확인 및 클리어 (필요시)
redis-cli flushall
```

### 단계 3: 서비스 재시작
```bash
# 백엔드 재시작
pkill -f "nest start" && cd apps/backend && npm run start:dev

# 프론트엔드 재시작  
pkill -f "next dev" && cd apps/web && npm run dev
```

### 단계 4: 네트워크 연결 확인
```bash
# 외부 API 접근 가능성 확인
ping api.stlouisfed.org
curl -I https://api.stlouisfed.org
```

## 📈 성공 확인 방법

### 실제 API 데이터 사용 시 확인할 지표:
1. **Fear & Greed Index**: 40이 아닌 실시간 값
2. **경제 지표**: 최신 정부 발표 수치와 일치
3. **로그 메시지**: "Fetching fresh data" 메시지 확인
4. **응답 시간**: 캐시 히트 시 빠름 (< 100ms), API 호출 시 느림 (500ms-2s)

### 디버그 컴포넌트 추가

실시간 데이터 상태를 화면에 표시하는 컴포넌트:

```tsx
const ApiStatusIndicator = ({ data }) => {
  const isRealData = data?.fearGreedIndex?.value !== 40;
  return (
    <div className={`px-2 py-1 rounded text-xs ${
      isRealData ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isRealData ? '🟢 실시간 데이터' : '⚠️ Mock 데이터'}
    </div>
  );
};
```

## 🎯 최종 목표

- [ ] FRED API에서 실시간 경제 지표 수신
- [ ] SerpApi에서 실시간 주식 데이터 수신  
- [ ] Claude API에서 AI 분석 수신
- [ ] 프론트엔드에서 실시간 데이터 표시 확인
- [ ] Mock 데이터 의존성 제거

## 📞 문제 해결 지원

문제가 지속될 경우 다음 정보와 함께 문의:
1. 백엔드 로그 전체 출력
2. 외부 API 직접 호출 결과
3. 환경변수 설정 상태 (키 제외)
4. 네트워크/방화벽 상태