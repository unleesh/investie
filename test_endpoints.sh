#!/bin/bash

echo "🧪 BE1 Implementation Test Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BASE_URL="http://localhost:3000"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -e "${YELLOW}Testing $name...${NC}"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint")
    http_code="${response: -3}"
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✅ $name: SUCCESS (HTTP $http_code)${NC}"
        echo "Response preview:"
        head -c 200 /tmp/response.json
        echo -e "\n"
    else
        echo -e "${RED}❌ $name: FAILED (HTTP $http_code)${NC}"
        cat /tmp/response.json
        echo -e "\n"
    fi
    
    echo "---"
}

# Check if backend is running
echo "Checking if backend is running..."
if curl -s "$BASE_URL/api/v1/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running. Please start it first:${NC}"
    echo "cd /Users/seinoh/Desktop/github/investie/apps/backend && npm run start:dev"
    exit 1
fi

echo -e "\n🔍 Testing API Endpoints:"
echo "========================="

# Test health endpoint
test_endpoint "/api/v1/health" "Health Check"

# Test market summary endpoint  
test_endpoint "/api/v1/market-summary" "Market Summary (SerpApi + FRED)"

# Test all stocks endpoint
test_endpoint "/api/v1/stocks" "All Stocks (SerpApi)"

# Test individual stock endpoints
stocks=("AAPL" "TSLA" "MSFT" "GOOGL" "NVDA")
for stock in "${stocks[@]}"; do
    test_endpoint "/api/v1/stocks/$stock" "Stock Data - $stock"
done

echo -e "\n📊 Test Summary:"
echo "================"
echo "If all endpoints return HTTP 200, BE1 implementation is working correctly!"
echo -e "${YELLOW}Note: First API calls may take longer due to external API requests${NC}"

# Clean up
rm -f /tmp/response.json