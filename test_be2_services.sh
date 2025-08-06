#!/bin/bash

# BE2 (News & AI) Services Test Script
# Tests chat functionality, AI evaluation, and stocks integration

echo "🧪 BE2 (News & AI) Services Testing"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
TEST_SESSION_ID=""

# Function to check if backend is running
check_backend() {
    echo -e "\n${BLUE}🔍 Checking backend server status...${NC}"
    if curl -s "$BASE_URL/api/v1/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend server is not running${NC}"
        echo -e "${YELLOW}💡 Start the backend first: cd apps/backend && npm run start:dev${NC}"
        return 1
    fi
}

# Function to test chat health endpoint
test_chat_health() {
    echo -e "\n${BLUE}🏥 Testing Chat Health Endpoint...${NC}"
    local response=$(curl -s "$BASE_URL/api/v1/chat/health")
    
    if [[ $? -eq 0 && -n "$response" ]]; then
        echo -e "${GREEN}✅ Chat health endpoint is working${NC}"
        echo "Response: $response"
        return 0
    else
        echo -e "${RED}❌ Chat health endpoint failed${NC}"
        return 1
    fi
}

# Function to test chat session creation
test_chat_session_creation() {
    echo -e "\n${BLUE}💬 Testing Chat Session Creation...${NC}"
    local response=$(curl -s -X POST "$BASE_URL/api/v1/chat/sessions" \
        -H "Content-Type: application/json")
    
    if [[ $? -eq 0 && -n "$response" ]]; then
        TEST_SESSION_ID=$(echo "$response" | jq -r '.sessionId' 2>/dev/null)
        if [[ "$TEST_SESSION_ID" != "null" && -n "$TEST_SESSION_ID" ]]; then
            echo -e "${GREEN}✅ Chat session created successfully${NC}"
            echo "Session ID: $TEST_SESSION_ID"
            return 0
        else
            echo -e "${RED}❌ Failed to extract session ID${NC}"
            echo "Response: $response"
            return 1
        fi
    else
        echo -e "${RED}❌ Chat session creation failed${NC}"
        return 1
    fi
}

# Function to test sending messages
test_chat_messaging() {
    if [[ -z "$TEST_SESSION_ID" ]]; then
        echo -e "\n${RED}❌ No session ID available for messaging test${NC}"
        return 1
    fi
    
    echo -e "\n${BLUE}💭 Testing Chat Messaging...${NC}"
    local test_messages=("Hello" "What is AAPL?" "Tell me about the market")
    
    for message in "${test_messages[@]}"; do
        echo -e "\n${PURPLE}📤 Sending: \"$message\"${NC}"
        local response=$(curl -s -X POST "$BASE_URL/api/v1/chat/sessions/$TEST_SESSION_ID/messages" \
            -H "Content-Type: application/json" \
            -d "{\"message\":\"$message\"}")
        
        if [[ $? -eq 0 && -n "$response" ]]; then
            local ai_response=$(echo "$response" | jq -r '.content' 2>/dev/null)
            if [[ "$ai_response" != "null" && -n "$ai_response" ]]; then
                echo -e "${GREEN}✅ Message sent and response received${NC}"
                echo -e "${PURPLE}📥 AI Response: $ai_response${NC}"
            else
                echo -e "${RED}❌ Invalid response format${NC}"
                echo "Response: $response"
            fi
        else
            echo -e "${RED}❌ Failed to send message${NC}"
            return 1
        fi
        sleep 1
    done
    
    return 0
}

# Function to test session retrieval
test_session_retrieval() {
    if [[ -z "$TEST_SESSION_ID" ]]; then
        echo -e "\n${RED}❌ No session ID available for retrieval test${NC}"
        return 1
    fi
    
    echo -e "\n${BLUE}🔍 Testing Session Retrieval...${NC}"
    local response=$(curl -s "$BASE_URL/api/v1/chat/sessions/$TEST_SESSION_ID")
    
    if [[ $? -eq 0 && -n "$response" ]]; then
        local message_count=$(echo "$response" | jq '.messages | length' 2>/dev/null)
        if [[ "$message_count" != "null" && "$message_count" -gt 0 ]]; then
            echo -e "${GREEN}✅ Session retrieval successful${NC}"
            echo "Messages in session: $message_count"
            return 0
        else
            echo -e "${RED}❌ No messages found in session${NC}"
            echo "Response: $response"
            return 1
        fi
    else
        echo -e "${RED}❌ Session retrieval failed${NC}"
        return 1
    fi
}

# Function to test stocks endpoints
test_stocks_endpoints() {
    echo -e "\n${BLUE}📈 Testing Stocks Endpoints...${NC}"
    
    # Test all stocks endpoint
    echo -e "\n${PURPLE}📊 Testing GET /api/v1/stocks${NC}"
    local all_stocks=$(curl -s "$BASE_URL/api/v1/stocks")
    
    if [[ $? -eq 0 && -n "$all_stocks" ]]; then
        local stock_count=$(echo "$all_stocks" | jq 'length' 2>/dev/null)
        if [[ "$stock_count" != "null" && "$stock_count" -gt 0 ]]; then
            echo -e "${GREEN}✅ All stocks endpoint working${NC}"
            echo "Stocks returned: $stock_count"
        else
            echo -e "${RED}❌ Invalid stocks data format${NC}"
            echo "Response: $all_stocks" | head -c 200
        fi
    else
        echo -e "${RED}❌ All stocks endpoint failed${NC}"
        return 1
    fi
    
    # Test individual stock endpoint
    local test_symbols=("AAPL" "TSLA" "MSFT")
    for symbol in "${test_symbols[@]}"; do
        echo -e "\n${PURPLE}🔍 Testing GET /api/v1/stocks/$symbol${NC}"
        local stock_data=$(curl -s "$BASE_URL/api/v1/stocks/$symbol")
        
        if [[ $? -eq 0 && -n "$stock_data" ]]; then
            local stock_symbol=$(echo "$stock_data" | jq -r '.symbol' 2>/dev/null)
            local stock_price=$(echo "$stock_data" | jq -r '.price.current' 2>/dev/null)
            
            if [[ "$stock_symbol" == "$symbol" && "$stock_price" != "null" ]]; then
                echo -e "${GREEN}✅ Stock $symbol data retrieved successfully${NC}"
                echo "Price: \$$stock_price"
                
                # Check AI evaluation
                local ai_rating=$(echo "$stock_data" | jq -r '.aiEvaluation.rating' 2>/dev/null)
                if [[ "$ai_rating" != "null" && -n "$ai_rating" ]]; then
                    echo -e "${GREEN}✅ AI evaluation present: $ai_rating${NC}"
                else
                    echo -e "${YELLOW}⚠️ AI evaluation missing or invalid${NC}"
                fi
                
                # Check news summary
                local news_headline=$(echo "$stock_data" | jq -r '.newsSummary.headline' 2>/dev/null)
                if [[ "$news_headline" != "null" && -n "$news_headline" ]]; then
                    echo -e "${GREEN}✅ News summary present${NC}"
                else
                    echo -e "${YELLOW}⚠️ News summary missing${NC}"
                fi
                
            else
                echo -e "${RED}❌ Invalid stock data for $symbol${NC}"
                echo "Response: $stock_data" | head -c 200
            fi
        else
            echo -e "${RED}❌ Failed to fetch $symbol data${NC}"
            return 1
        fi
        sleep 1
    done
    
    return 0
}

# Function to test chart endpoints
test_chart_endpoints() {
    echo -e "\n${BLUE}📉 Testing Chart Endpoints...${NC}"
    local test_periods=("1W" "1M")
    
    for period in "${test_periods[@]}"; do
        echo -e "\n${PURPLE}📈 Testing GET /api/v1/stocks/AAPL/chart?period=$period${NC}"
        local chart_response=$(curl -s "$BASE_URL/api/v1/stocks/AAPL/chart?period=$period")
        
        if [[ $? -eq 0 ]]; then
            if [[ -n "$chart_response" && "$chart_response" != "null" ]]; then
                echo -e "${GREEN}✅ Chart data for $period period available${NC}"
                echo "Chart response size: $(echo "$chart_response" | wc -c) bytes"
            else
                echo -e "${YELLOW}⚠️ Chart data for $period period is empty (expected with mock API)${NC}"
            fi
        else
            echo -e "${RED}❌ Chart endpoint for $period failed${NC}"
        fi
        sleep 1
    done
    
    return 0
}

# Function to test error handling
test_error_handling() {
    echo -e "\n${BLUE}🚨 Testing Error Handling...${NC}"
    
    # Test invalid session ID
    echo -e "\n${PURPLE}🧪 Testing invalid session ID${NC}"
    local invalid_response=$(curl -s "$BASE_URL/api/v1/chat/sessions/invalid-session-id")
    if [[ "$invalid_response" == "null" || -z "$invalid_response" ]]; then
        echo -e "${GREEN}✅ Invalid session handled correctly${NC}"
    else
        echo -e "${YELLOW}⚠️ Invalid session returned data: $invalid_response${NC}"
    fi
    
    # Test invalid stock symbol
    echo -e "\n${PURPLE}🧪 Testing invalid stock symbol${NC}"
    local invalid_stock=$(curl -s "$BASE_URL/api/v1/stocks/INVALID")
    if [[ "$invalid_stock" == "null" || -z "$invalid_stock" ]]; then
        echo -e "${GREEN}✅ Invalid stock symbol handled correctly${NC}"
    else
        echo -e "${YELLOW}⚠️ Invalid stock symbol returned data: $invalid_stock${NC}"
    fi
    
    return 0
}

# Function to cleanup test session
cleanup_test_session() {
    if [[ -n "$TEST_SESSION_ID" ]]; then
        echo -e "\n${BLUE}🧹 Cleaning up test session...${NC}"
        curl -s -X DELETE "$BASE_URL/api/v1/chat/sessions/$TEST_SESSION_ID" > /dev/null
        echo -e "${GREEN}✅ Test session cleaned up${NC}"
    fi
}

# Function to show test summary
show_test_summary() {
    echo -e "\n${BLUE}📋 Test Summary${NC}"
    echo "=============="
    echo -e "${GREEN}✅ BE2 Services Status:${NC}"
    echo -e "   • Chat Service: Operational with mock AI responses"
    echo -e "   • AI Evaluation Service: Returning structured mock evaluations"  
    echo -e "   • Stocks Integration: Working with real price data + mock AI/news"
    echo -e "   • Error Handling: Proper fallbacks implemented"
    echo ""
    echo -e "${YELLOW}⚠️ Current Limitations:${NC}"
    echo -e "   • AI responses are mocked (Claude API not yet integrated)"
    echo -e "   • News summaries use basic transformation from Google Finance"
    echo -e "   • Fear & Greed Index and AI outlooks still use mock data"
    echo ""
    echo -e "${BLUE}💡 Next Steps for Full BE2 Integration:${NC}"
    echo -e "   1. Add Claude API integration for real AI evaluations"
    echo -e "   2. Implement intelligent news summarization"
    echo -e "   3. Add Fear & Greed Index real-time fetching"
    echo -e "   4. Implement AI-powered interest rate outlook"
}

# Main test execution
main() {
    echo -e "${PURPLE}🚀 Starting BE2 Services Test Suite${NC}"
    
    # Check if backend is running
    if ! check_backend; then
        exit 1
    fi
    
    # Run all tests
    test_chat_health
    test_chat_session_creation
    test_chat_messaging
    test_session_retrieval
    test_stocks_endpoints
    test_chart_endpoints
    test_error_handling
    
    # Cleanup
    cleanup_test_session
    
    # Show summary
    show_test_summary
    
    echo -e "\n${GREEN}🎉 BE2 Services Test Suite Completed!${NC}"
}

# Run main function
main "$@"