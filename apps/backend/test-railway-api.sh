#!/bin/bash

# Railway API 테스트 스크립트
# 실제 API 키로 배포된 백엔드의 모든 기능을 테스트합니다.

RAILWAY_API="https://investie-backend-02-production.up.railway.app"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "🚀 Investie Backend API Test Report"
echo "📅 Generated: $TIMESTAMP"
echo "🌐 Railway URL: $RAILWAY_API"
echo "="*60

# 1. Health Check
echo "1️⃣  HEALTH CHECK"
echo "="*30
HEALTH=$(curl -s "$RAILWAY_API/api/v1/health")
echo "Status: $(echo $HEALTH | jq -r '.status')"
echo "Message: $(echo $HEALTH | jq -r '.message')"
echo

# 2. Market Summary
echo "2️⃣  MARKET SUMMARY (Real API Data)"
echo "="*40
MARKET=$(curl -s "$RAILWAY_API/api/v1/market-summary")
if [ "$(echo $MARKET | jq -r '.fearGreedIndex.value')" != "null" ]; then
    echo "✅ Fear & Greed Index: $(echo $MARKET | jq -r '.fearGreedIndex.value') ($(echo $MARKET | jq -r '.fearGreedIndex.status'))"
    echo "✅ VIX: $(echo $MARKET | jq -r '.vix.value') ($(echo $MARKET | jq -r '.vix.status'))"
    echo "✅ Interest Rate: $(echo $MARKET | jq -r '.interestRate.value')%"
    echo "✅ CPI: $(echo $MARKET | jq -r '.cpi.value')%"
    echo "✅ Unemployment: $(echo $MARKET | jq -r '.unemploymentRate.value')%"
    echo "🤖 AI Interest Rate Outlook: $(echo $MARKET | jq -r '.interestRate.aiOutlook' | head -c 100)..."
else
    echo "❌ Market data not available - API keys may be missing"
fi
echo

# 3. All Stocks
echo "3️⃣  STOCKS OVERVIEW"
echo "="*30
STOCKS=$(curl -s "$RAILWAY_API/api/v1/stocks")
STOCK_COUNT=$(echo $STOCKS | jq 'length')
echo "📈 Total stocks available: $STOCK_COUNT/10"
echo

# 4. Individual Stocks Test
echo "4️⃣  INDIVIDUAL STOCKS (Sample)"
echo "="*35

SYMBOLS=("AAPL" "TSLA" "MSFT" "GOOGL" "NVDA")
for SYMBOL in "${SYMBOLS[@]}"; do
    echo "🔍 Testing $SYMBOL..."
    STOCK=$(curl -s "$RAILWAY_API/api/v1/stocks/$SYMBOL")
    if [ "$(echo $STOCK | jq -r '.symbol')" != "null" ]; then
        echo "  ✅ $SYMBOL: \$$(echo $STOCK | jq -r '.price.current') ($(echo $STOCK | jq -r '.price.changePercent')%)"
        echo "  📊 PE Ratio: $(echo $STOCK | jq -r '.fundamentals.pe')"
        echo "  🤖 AI Rating: $(echo $STOCK | jq -r '.aiEvaluation.rating') ($(echo $STOCK | jq -r '.aiEvaluation.confidence')% confidence)"
        echo "  📰 News: $(echo $STOCK | jq -r '.newsSummary.headline' | head -c 60)..."
    else
        echo "  ❌ $SYMBOL: No data available"
    fi
    echo
done

# 5. Chat System Test
echo "5️⃣  AI CHAT SYSTEM"
echo "="*25
CHAT_HEALTH=$(curl -s "$RAILWAY_API/api/v1/chat/health")
echo "Chat Status: $(echo $CHAT_HEALTH | jq -r '.status')"
echo "Claude API: $(echo $CHAT_HEALTH | jq -r '.hasApiKey')"
echo

# 6. API Performance Summary
echo "6️⃣  API PERFORMANCE SUMMARY"
echo "="*35
start_time=$(date +%s)
curl -s "$RAILWAY_API/api/v1/market-summary" > /dev/null
market_time=$(($(date +%s) - start_time))

start_time=$(date +%s)
curl -s "$RAILWAY_API/api/v1/stocks/AAPL" > /dev/null
stock_time=$(($(date +%s) - start_time))

echo "⚡ Market Summary Response: ${market_time}s"
echo "⚡ Stock Data Response: ${stock_time}s"
echo

echo "🏁 Test Complete!"
echo "📋 Full API Documentation: https://investie-backend-02-production.up.railway.app"
echo "💡 Add '/api/v1/stocks/SYMBOL' for any stock (AAPL, TSLA, MSFT, etc.)"