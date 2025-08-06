# BE1 구현 검증 가이드

## 개요
이 가이드는 BE1 (Financial Data) 구현이 올바르게 작동하는지 확인하는 방법을 안내합니다.

## 🚀 백엔드 서버 시작

### 1. 터미널에서 백엔드 디렉토리로 이동
```bash
cd /Users/seinoh/Desktop/github/investie/apps/backend
```

### 2. 개발 서버 시작
```bash
npm run start:dev
```

### 3. 서버 시작 확인
다음과 같은 로그가 나타나면 서버가 정상적으로 시작된 것입니다:
```
[Nest] 12345  - [날짜/시간]   LOG [Application] Nest application successfully started +xms
```

## 🧪 자동 테스트 실행

### 새 터미널 창에서 테스트 스크립트 실행
```bash
cd /Users/seinoh/Desktop/github/investie
./test_endpoints.sh
```

### 예상 결과
모든 엔드포인트가 HTTP 200 상태 코드를 반환하면 성공입니다:
```
✅ Health Check: SUCCESS (HTTP 200)
✅ Market Summary (SerpApi + FRED): SUCCESS (HTTP 200)  
✅ All Stocks (SerpApi): SUCCESS (HTTP 200)
✅ Stock Data - AAPL: SUCCESS (HTTP 200)
✅ Stock Data - TSLA: SUCCESS (HTTP 200)
...
```

## 🔍 수동 API 테스트

### 브라우저에서 직접 확인
다음 URL들을 브라우저에서 직접 방문하여 JSON 응답을 확인할 수 있습니다:

1. **서버 상태 확인**
   ```
   http://localhost:3000/api/v1/health
   ```

2. **시장 요약 데이터** (SerpApi + FRED API 통합)
   ```
   http://localhost:3000/api/v1/market-summary
   ```

3. **모든 주식 데이터** (SerpApi 통합)
   ```
   http://localhost:3000/api/v1/stocks
   ```

4. **개별 주식 데이터**
   ```
   http://localhost:3000/api/v1/stocks/AAPL
   http://localhost:3000/api/v1/stocks/TSLA
   http://localhost:3000/api/v1/stocks/MSFT
   ```

### curl 명령어로 테스트
```bash
# 시장 요약 데이터
curl http://localhost:3000/api/v1/market-summary | jq

# 개별 주식 데이터  
curl http://localhost:3000/api/v1/stocks/AAPL | jq
```

## 📊 응답 데이터 확인 포인트

### 1. Market Summary 응답 구조
```json
{
  "fearGreedIndex": {
    "value": 숫자,
    "status": "fear|neutral|greed",
    "source": "claude_search"
  },
  "vix": {
    "value": 숫자,
    "status": "low|medium|high", 
    "source": "google_finance"
  },
  "interestRate": {
    "value": 숫자,
    "aiOutlook": "문자열",
    "source": "fred_api"
  },
  "cpi": {
    "value": 숫자,
    "monthOverMonth": 숫자,
    "direction": "up|down",
    "source": "fred_api"
  },
  "unemploymentRate": {
    "value": 숫자,
    "monthOverMonth": 숫자,
    "source": "fred_api"
  }
}
```

### 2. Stock Data 응답 구조
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": {
    "current": 숫자,
    "change": 숫자,
    "changePercent": 숫자,
    "source": "google_finance"
  },
  "fundamentals": {
    "pe": 숫자,
    "marketCap": 숫자,
    "volume": 숫자,
    "source": "google_finance"
  },
  "technicals": {
    "rsi": 숫자,
    "rsiStatus": "oversold|neutral|overbought"
  }
}
```

## 🔧 API 통합 확인

### SerpApi 통합 확인
- VIX 데이터가 실제 SerpApi에서 가져와지는지 확인
- 주식 가격 데이터가 실시간으로 업데이트되는지 확인
- 첫 API 호출은 느릴 수 있음 (외부 API 요청)

### FRED API 통합 확인  
- CPI, Interest Rate, Unemployment Rate가 최신 데이터인지 확인
- 경제 지표 값들이 합리적인 범위 내에 있는지 확인

## 🚨 문제 해결

### 서버가 시작되지 않는 경우
1. 패키지가 제대로 설치되었는지 확인:
   ```bash
   cd /Users/seinoh/Desktop/github/investie/apps/backend
   npm install --legacy-peer-deps
   ```

2. 환경변수 확인:
   ```bash
   cat .env
   ```
   필수: `SERPAPI_API_KEY`, `FRED_API_KEY`

### API 요청이 실패하는 경우
1. 백엔드 로그 확인 (터미널에서 확인)
2. API 키가 올바른지 확인
3. 외부 API 서비스 상태 확인

### Mock 데이터로 Fallback되는 경우
- API 키가 잘못되었거나 외부 API가 응답하지 않는 경우
- 이 경우에도 서비스는 정상 동작하며 mock 데이터를 반환

## ✅ 성공 기준

다음 조건들이 만족되면 BE1 구현이 성공적으로 완료된 것입니다:

1. **서버 시작**: 백엔드 서버가 오류 없이 시작됨
2. **API 응답**: 모든 엔드포인트가 HTTP 200 반환
3. **데이터 구조**: 응답 데이터가 올바른 TypeScript 타입 구조를 가짐
4. **외부 API 통합**: SerpApi와 FRED API가 실제 데이터를 반환
5. **Fallback 처리**: API 실패 시 mock 데이터로 안정적으로 전환

## 📝 검증 완료 후 다음 단계

BE1 검증이 완료되면 다음을 진행할 수 있습니다:
- 프론트엔드에서 API 호출 테스트
- 캐시 레이어 추가 (성능 최적화)
- AI 평가 기능 구현 (BE2)
- 배포 환경 설정