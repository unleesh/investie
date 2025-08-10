#!/bin/bash

RAILWAY_URL="https://investie-backend-02-production.up.railway.app"

echo "🔍 Railway 배포 상태 종합 진단"
echo "============================="
echo ""

echo "1️⃣ 기본 서버 상태:"
health=$(curl -s "$RAILWAY_URL/api/v1/health")
echo "$health" | jq .
echo ""

echo "2️⃣ 마켓 데이터 (FRED API 테스트):"
market=$(curl -s "$RAILWAY_URL/api/v1/market-summary")
fear_greed=$(echo "$market" | jq -r '.fearGreedIndex.value')
interest_rate=$(echo "$market" | jq -r '.interestRate.value')
echo "Fear & Greed: $fear_greed"
echo "Interest Rate: $interest_rate%"
echo ""

echo "3️⃣ 주식 데이터 샘플:"
stock=$(curl -s "$RAILWAY_URL/api/v1/stocks/AAPL")
echo "AAPL Response:"
echo "$stock" | jq '{symbol, price: .price.current, source: .price.source, timestamp: now}'
echo ""

echo "4️⃣ 디버그 엔드포인트 확인:"
debug_response=$(curl -s -w "%{http_code}" "$RAILWAY_URL/api/v1/debug" 2>/dev/null)
if [[ "$debug_response" == *"404"* ]]; then
    echo "❌ Debug endpoint not available (404)"
else
    echo "✅ Debug endpoint accessible"
fi
echo ""

echo "5️⃣ 버전 확인:"
version=$(echo "$health" | jq -r '.version // "No version info"')
echo "Current version: $version"
echo ""

echo "📋 진단 결과:"
echo "============"
if [ "$fear_greed" != "null" ] && [ "$fear_greed" != "0" ]; then
    echo "✅ FRED API: 작동 중"
else
    echo "❌ FRED API: 문제 있음"
fi

stock_price=$(echo "$stock" | jq -r '.price.current')
if [ "$stock_price" != "0" ] && [ "$stock_price" != "null" ]; then
    echo "✅ SerpApi: 작동 중 ($stock_price)"
else
    echo "❌ SerpApi: 문제 있음 (가격: $stock_price)"
fi

if [[ "$version" == *"serpapi-fix"* ]]; then
    echo "✅ 최신 배포: 적용됨"
else
    echo "❌ 최신 배포: 아직 적용 안됨"
fi

echo ""
echo "💡 다음 단계:"
if [[ "$version" != *"serpapi-fix"* ]]; then
    echo "   - Railway 배포 완료까지 더 기다리기"
    echo "   - Railway CLI로 로그 확인: railway logs"
    echo "   - Railway 대시보드에서 배포 상태 확인"
else
    echo "   - SerpApi 키가 Railway 환경 변수에 제대로 설정되어 있는지 확인"
    echo "   - Railway 대시보드 → Environment Variables 확인"
fi