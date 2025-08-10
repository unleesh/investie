#!/bin/bash

RAILWAY_URL="https://investie-backend-02-production.up.railway.app"
MAX_WAIT=300  # 5분 최대 대기
WAIT_INTERVAL=30  # 30초마다 체크
elapsed=0

echo "🚀 Railway 배포 완료 대기 및 테스트"
echo "================================"
echo "URL: $RAILWAY_URL"
echo "최대 대기시간: $(($MAX_WAIT/60))분"
echo ""

# 배포 완료 확인 함수
check_deployment() {
    local response=$(curl -s "$RAILWAY_URL/api/v1/health")
    local version=$(echo $response | jq -r '.version // empty')
    
    if [[ "$version" == *"serpapi-fix"* ]]; then
        echo "✅ 새 배포 감지됨: $version"
        return 0
    else
        echo "⏳ 아직 구 배포 상태... ($(date '+%H:%M:%S'))"
        return 1
    fi
}

# 배포 완료까지 대기
while [ $elapsed -lt $MAX_WAIT ]; do
    if check_deployment; then
        echo ""
        echo "🎉 배포 완료! SerpApi 수정사항 테스트 시작..."
        break
    fi
    
    sleep $WAIT_INTERVAL
    elapsed=$((elapsed + WAIT_INTERVAL))
done

if [ $elapsed -ge $MAX_WAIT ]; then
    echo ""
    echo "⏰ 최대 대기시간 초과. 현재 상태로 테스트 진행..."
fi

echo ""
echo "📊 SerpApi 수정사항 테스트 결과"
echo "=============================="

# 테스트 실행
SYMBOLS=("AAPL" "TSLA" "MSFT")

for symbol in "${SYMBOLS[@]}"; do
    echo "🔍 Testing $symbol..."
    
    # 주식 데이터 가져오기
    response=$(curl -s "$RAILWAY_URL/api/v1/stocks/$symbol")
    price=$(echo $response | jq -r '.price.current')
    change=$(echo $response | jq -r '.price.change')
    changePercent=$(echo $response | jq -r '.price.changePercent')
    
    if [ "$price" != "0" ] && [ "$price" != "null" ]; then
        echo "  ✅ $symbol: \$${price} (${changePercent}%)"
        echo "  📈 Change: \$${change}"
    else
        echo "  ❌ $symbol: No price data (still showing 0)"
    fi
    echo ""
done

echo "🏁 테스트 완료!"
echo ""
echo "💡 실시간 모니터링을 원한다면:"
echo "   watch -n 10 'curl -s \"$RAILWAY_URL/api/v1/stocks/AAPL\" | jq \".price\"'"