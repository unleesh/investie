#!/bin/bash

echo "🔍 Railway API Keys Status Check"
echo "================================"

RAILWAY_API="https://investie-backend-02-production.up.railway.app"

echo "1. Health Check:"
curl -s "$RAILWAY_API/api/v1/health" | jq -r '.status'

echo -e "\n2. Market Summary (Tests FRED + Claude APIs):"
MARKET=$(curl -s "$RAILWAY_API/api/v1/market-summary")
FEAR_GREED=$(echo $MARKET | jq -r '.fearGreedIndex.value')
INTEREST_RATE=$(echo $MARKET | jq -r '.interestRate.value')
AI_OUTLOOK=$(echo $MARKET | jq -r '.interestRate.aiOutlook')

if [ "$FEAR_GREED" != "null" ] && [ "$FEAR_GREED" != "0" ]; then
    echo "✅ FRED API: Working (Interest Rate: ${INTEREST_RATE}%)"
else
    echo "❌ FRED API: Not working"
fi

if [ "$AI_OUTLOOK" != "null" ] && [ "$AI_OUTLOOK" != "" ]; then
    echo "✅ Claude AI: Working (${AI_OUTLOOK:0:50}...)"
else
    echo "❌ Claude AI: Not working"
fi

echo -e "\n3. Stock Data (Tests SerpApi):"
STOCK=$(curl -s "$RAILWAY_API/api/v1/stocks/AAPL")
STOCK_PRICE=$(echo $STOCK | jq -r '.price.current')

if [ "$STOCK_PRICE" != "null" ] && [ "$STOCK_PRICE" != "0" ]; then
    echo "✅ SerpApi: Working (AAPL: \$${STOCK_PRICE})"
else
    echo "❌ SerpApi: Not working (Price: $STOCK_PRICE)"
fi

echo -e "\n4. Chat System (Tests Claude API):"
CHAT=$(curl -s "$RAILWAY_API/api/v1/chat/health")
CHAT_STATUS=$(echo $CHAT | jq -r '.hasApiKey')
echo "Claude API Key Status: $CHAT_STATUS"

echo -e "\n📋 SUMMARY:"
echo "=========="
if [ "$INTEREST_RATE" != "null" ] && [ "$INTEREST_RATE" != "0" ]; then
    echo "🟢 Market Data: Working"
else
    echo "🔴 Market Data: Failed"
fi

if [ "$STOCK_PRICE" != "0" ]; then
    echo "🟢 Stock Data: Working"
else
    echo "🔴 Stock Data: Failed (Most likely SerpApi key issue)"
fi

echo -e "\n💡 If Stock Data is failing, check Railway environment variables:"
echo "   - SERPAPI_API_KEY should be set"
echo "   - CLAUDE_API_KEY should be set"
echo "   - FRED_API_KEY should be set"