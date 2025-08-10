#!/bin/bash

# Production Deployment Testing Script
# Tests both frontend and backend deployments

BACKEND_URL="https://investie-backend-02-production.up.railway.app"
FRONTEND_URL="https://investie-frontend.vercel.app"

echo "🧪 Testing Production Deployment"
echo "================================"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Function to check URL with timeout
check_url() {
  local url=$1
  local name=$2
  
  echo "🔍 Testing $name..."
  if curl -f -s --max-time 30 "$url" > /dev/null; then
    echo "✅ $name is responsive"
    return 0
  else
    echo "❌ $name failed to respond"
    return 1
  fi
}

# Function to test API endpoint
test_api() {
  local endpoint=$1
  local name=$2
  
  echo "🔍 Testing $name API..."
  local response=$(curl -s --max-time 30 "$BACKEND_URL$endpoint")
  
  if echo "$response" | jq . > /dev/null 2>&1; then
    echo "✅ $name API returned valid JSON"
    return 0
  else
    echo "❌ $name API failed or returned invalid JSON"
    echo "Response: $response"
    return 1
  fi
}

# Start tests
failed_tests=0

# Test frontend
if ! check_url "$FRONTEND_URL" "Frontend"; then
  ((failed_tests++))
fi

# Test backend health
if ! check_url "$BACKEND_URL/api/v1/health" "Backend Health"; then
  ((failed_tests++))
fi

# Test specific API endpoints
if ! test_api "/api/v1/stocks/AAPL" "Stock Data"; then
  ((failed_tests++))
fi

if ! test_api "/api/v1/market-summary" "Market Summary"; then
  ((failed_tests++))
fi

if ! test_api "/api/v1/stocks" "All Stocks"; then
  ((failed_tests++))
fi

# Test stock symbol validation
echo "🔍 Testing Stock Symbol..."
symbol_response=$(curl -s --max-time 30 "$BACKEND_URL/api/v1/stocks/AAPL" | jq -r '.symbol // empty')
if [ "$symbol_response" = "AAPL" ]; then
  echo "✅ Stock Symbol validation passed"
else
  echo "❌ Stock Symbol validation failed"
  ((failed_tests++))
fi

# Test AI evaluation
echo "🔍 Testing AI Evaluation..."
ai_response=$(curl -s --max-time 30 "$BACKEND_URL/api/v1/stocks/AAPL" | jq -r '.aiEvaluation.rating // empty')
if [ ! -z "$ai_response" ] && [ "$ai_response" != "null" ]; then
  echo "✅ AI Evaluation is working"
else
  echo "❌ AI Evaluation failed"
  ((failed_tests++))
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"

if [ $failed_tests -eq 0 ]; then
  echo "🎉 All tests passed! Production deployment is working correctly."
  echo ""
  echo "🚀 Application URLs:"
  echo "Frontend: $FRONTEND_URL"
  echo "Backend:  $BACKEND_URL"
  echo "API Docs: $BACKEND_URL/api/v1/health"
  exit 0
else
  echo "⚠️  $failed_tests test(s) failed. Please check the deployment."
  echo ""
  echo "🔧 Troubleshooting tips:"
  echo "- Check Railway deployment logs: railway logs --follow"
  echo "- Check Vercel deployment logs: vercel logs"
  echo "- Verify environment variables are set correctly"
  echo "- Check API keys configuration"
  exit 1
fi