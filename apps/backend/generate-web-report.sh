#!/bin/bash

# 웹 리포트 HTML 파일 생성
RAILWAY_API="https://investie-backend-02-production.up.railway.app"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
REPORT_FILE="investie-api-report.html"

cat > $REPORT_FILE << EOF
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Investie API Report - $TIMESTAMP</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 40px; background: #f5f5f7; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .section { margin-bottom: 30px; }
        .api-link { display: inline-block; padding: 8px 16px; background: #007AFF; color: white; text-decoration: none; border-radius: 6px; margin: 5px; }
        .api-link:hover { background: #0056CC; }
        .status-ok { color: #28a745; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .code-block { background: #f8f9fa; padding: 15px; border-radius: 6px; font-family: 'SF Mono', monospace; overflow-x: auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007AFF; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Investie Backend API Report</h1>
            <p><strong>Generated:</strong> $TIMESTAMP</p>
            <p><strong>Railway URL:</strong> <a href="$RAILWAY_API" target="_blank">$RAILWAY_API</a></p>
        </div>

        <div class="section">
            <h2>📊 Live API Endpoints</h2>
            <div class="grid">
                <div class="card">
                    <h3>Health Check</h3>
                    <a href="$RAILWAY_API/api/v1/health" class="api-link" target="_blank">Health Status</a>
                    <p>기본 서버 상태 확인</p>
                </div>
                
                <div class="card">
                    <h3>Market Data</h3>
                    <a href="$RAILWAY_API/api/v1/market-summary" class="api-link" target="_blank">Market Summary</a>
                    <p>실시간 시장 데이터 (Fear & Greed, VIX, 금리)</p>
                </div>
                
                <div class="card">
                    <h3>Stock Data</h3>
                    <a href="$RAILWAY_API/api/v1/stocks" class="api-link" target="_blank">All Stocks</a>
                    <a href="$RAILWAY_API/api/v1/stocks/AAPL" class="api-link" target="_blank">Apple</a>
                    <a href="$RAILWAY_API/api/v1/stocks/TSLA" class="api-link" target="_blank">Tesla</a>
                    <p>주식 데이터 (AI 평가 포함)</p>
                </div>
                
                <div class="card">
                    <h3>Chat System</h3>
                    <a href="$RAILWAY_API/api/v1/chat/health" class="api-link" target="_blank">Chat Health</a>
                    <p>AI 투자 어시스턴트 시스템</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🧪 테스트 명령어</h2>
            <h3>cURL 명령어:</h3>
            <div class="code-block">
# 마켓 서머리 테스트<br>
curl -s "$RAILWAY_API/api/v1/market-summary" | jq .<br><br>

# 애플 주식 테스트<br>
curl -s "$RAILWAY_API/api/v1/stocks/AAPL" | jq '.symbol, .price, .aiEvaluation.summary'<br><br>

# 전체 주식 리스트<br>
curl -s "$RAILWAY_API/api/v1/stocks" | jq 'length'
            </div>
        </div>

        <div class="section">
            <h2>📈 지원 종목 (10개)</h2>
            <div class="grid">
EOF

# Add stock links
STOCKS=("AAPL:Apple" "TSLA:Tesla" "MSFT:Microsoft" "GOOGL:Google" "AMZN:Amazon" "NVDA:NVIDIA" "META:Meta" "NFLX:Netflix" "AVGO:Broadcom" "AMD:AMD")

for stock in "${STOCKS[@]}"; do
    IFS=':' read -r symbol name <<< "$stock"
    cat >> $REPORT_FILE << EOF
                <div class="card">
                    <h4>$name ($symbol)</h4>
                    <a href="$RAILWAY_API/api/v1/stocks/$symbol" class="api-link" target="_blank">$symbol 데이터</a>
                </div>
EOF
done

cat >> $REPORT_FILE << EOF
            </div>
        </div>

        <div class="section">
            <h2>🔧 API 기능</h2>
            <ul>
                <li>✅ <strong>API-First Architecture:</strong> 모든 데이터는 실제 API 키 필요</li>
                <li>✅ <strong>Real-time Data:</strong> FRED API (경제지표) + SerpApi (주식데이터) + Claude AI (분석)</li>
                <li>✅ <strong>TradingView Compatible:</strong> 프론트엔드 차트 위젯과 호환</li>
                <li>✅ <strong>AI Integration:</strong> Claude AI를 통한 투자 분석 및 추천</li>
                <li>✅ <strong>Production Ready:</strong> Railway에 배포된 안정적인 백엔드</li>
            </ul>
        </div>

        <div class="section">
            <h2>📝 사용법</h2>
            <p>1. 위의 API 링크들을 클릭하여 브라우저에서 직접 데이터 확인</p>
            <p>2. 터미널에서 cURL 명령어로 API 테스트</p>
            <p>3. 프론트엔드 애플리케이션에서 이 API 엔드포인트들을 사용</p>
        </div>

        <div class="section">
            <p style="text-align: center; color: #666; margin-top: 40px;">
                Generated by Investie Backend API System<br>
                <small>Last updated: $TIMESTAMP</small>
            </p>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 minutes
        setTimeout(() => location.reload(), 300000);
    </script>
</body>
</html>
EOF

echo "✅ 웹 리포트 생성 완료: $REPORT_FILE"
echo "🌐 브라우저에서 확인: open $REPORT_FILE"