# 🔑 BE2 API Key Testing Guide
**Complete Guide for Testing BE2 Services with Real API Keys**

## 📋 Overview

BE2 (News & AI) services require these API keys:
- **CLAUDE_API_KEY**: AI evaluations and chatbot responses
- **SERPAPI_API_KEY**: Google Finance data and news (shared with BE1) 
- **FRED_API_KEY**: Economic indicators (shared with BE1)

## 🎯 Required API Keys

### 1. Claude API Key (Primary for BE2)
**Purpose**: AI-powered stock evaluations and chat responses  
**Service**: Anthropic Claude API  
**Cost**: Pay-per-use (recommended for testing: $5-20)

**How to get**:
```bash
1. Visit: https://console.anthropic.com/
2. Sign up/Login
3. Go to: Settings → API Keys
4. Create new API key
5. Copy the key (starts with 'sk-ant-')
```

### 2. SerpApi Key (Shared with BE1)
**Purpose**: Google Finance stock data and news  
**Service**: SerpApi Google Finance  
**Cost**: Free tier: 100 searches/month

**How to get**:
```bash
1. Visit: https://serpapi.com/
2. Sign up for free account
3. Go to: Dashboard → API Key
4. Copy your API key
```

### 3. FRED API Key (Shared with BE1) 
**Purpose**: Economic indicators (CPI, Interest Rate, Unemployment)  
**Service**: Federal Reserve Economic Data  
**Cost**: Free

**How to get**:
```bash
1. Visit: https://fred.stlouisfed.org/docs/api/api_key.html
2. Request API key (requires email)
3. Check email for API key
```

## ⚙️ Step-by-Step Setup

### Step 1: Create Environment File
```bash
# Navigate to backend directory
cd apps/backend

# Copy example environment file
cp .env.example .env

# Edit the .env file
nano .env  # or use your preferred editor
```

### Step 2: Add Your API Keys
```bash
# Edit apps/backend/.env
FRED_API_KEY=your_actual_fred_api_key_here
SERPAPI_API_KEY=your_actual_serpapi_key_here
CLAUDE_API_KEY=your_actual_claude_api_key_here

# Other settings (optional)
NODE_ENV=development
PORT=3000
ECONOMIC_DATA_TTL=86400    # 24 hours
STOCK_DATA_TTL=300         # 5 minutes
AI_CONTENT_TTL=43200       # 12 hours
```

### Step 3: Verify API Keys
```bash
# Test each API key individually
./test_api_keys.sh
```

## 🧪 Testing Each API Key

### Test 1: FRED API Key (Economic Data)
```bash
# Manual test
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=YOUR_FRED_KEY&file_type=json&limit=1&sort_order=desc"

# Expected response: JSON with economic data
# Look for: {"realtime_start":"2024-01-01","realtime_end":"2024-01-01","observation_start":"1776-07-04"...}
```

### Test 2: SerpApi Key (Stock Data)
```bash
# Manual test
curl -s "https://serpapi.com/search.json?engine=google_finance&q=AAPL:NASDAQ&api_key=YOUR_SERPAPI_KEY"

# Expected response: JSON with AAPL stock data
# Look for: {"search_metadata":{"id":"..."},"summary":{"title":"Apple Inc"...}
```

### Test 3: Claude API Key (AI Services)
```bash
# Manual test (requires more complex request)
curl -s https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_CLAUDE_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-sonnet-20240229",
    "max_tokens": 100,
    "messages": [
      {"role": "user", "content": "What is AAPL stock?"}
    ]
  }'

# Expected response: JSON with AI response
# Look for: {"id":"msg_...","content":[{"text":"Apple Inc (AAPL)..."}]
```

## 🚀 Automated Testing Scripts

### Complete API Key Validation
```bash
# Run comprehensive API key tests
./validate_all_api_keys.sh
```

### Individual Service Tests
```bash
# Test BE1 services (FRED + SerpApi)
./test_be1_apis.sh

# Test BE2 services (Claude + integrated data)
./test_be2_apis.sh

# Test full integration (BE1 + BE2)
./test_full_integration.sh
```

## 📊 Expected Test Results

### ✅ Successful API Key Test Results

**FRED API**:
```json
{
  "realtime_start": "2024-01-01",
  "observations": [
    {
      "date": "2024-01-01",
      "value": "310.326"
    }
  ]
}
```

**SerpApi**:
```json
{
  "summary": {
    "title": "Apple Inc",
    "price": {
      "value": 150.25,
      "change": 2.15,
      "change_percent": 1.45
    }
  }
}
```

**Claude API**:
```json
{
  "content": [
    {
      "text": "Apple Inc (AAPL) is a technology company..."
    }
  ]
}
```

### ❌ Common Error Responses

**Invalid API Key**:
```json
{
  "error": {
    "type": "authentication_error",
    "message": "invalid api key"
  }
}
```

**Rate Limit Exceeded**:
```json
{
  "error": {
    "message": "You have exceeded your rate limit"
  }
}
```

**Insufficient Credits**:
```json
{
  "error": {
    "message": "Insufficient credits"
  }
}
```

## 🏃‍♂️ Quick Start Commands

### 1. Setup (5 minutes)
```bash
# Copy environment file and add your keys
cp apps/backend/.env.example apps/backend/.env
nano apps/backend/.env  # Add your API keys

# Build packages
npm run build:packages
```

### 2. Test API Keys (2 minutes)
```bash
# Test all API keys
./test_api_keys.sh

# Or test individually
curl -s "https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=YOUR_FRED_KEY&file_type=json&limit=1"
```

### 3. Run Backend with Real APIs (1 minute)
```bash
cd apps/backend
npm run start:dev

# Wait for startup, then test
curl -s http://localhost:3000/api/v1/market-summary | jq
curl -s http://localhost:3000/api/v1/stocks/AAPL | jq
```

## 🔍 Testing Workflow

### Phase 1: API Key Validation
1. **Setup Environment**: Add API keys to `.env`
2. **Test Individual APIs**: Verify each key works
3. **Check Quotas**: Ensure sufficient API credits

### Phase 2: Service Integration Testing  
1. **Start Backend**: `npm run start:dev`
2. **Test Market Data**: GET `/api/v1/market-summary`
3. **Test Stock Data**: GET `/api/v1/stocks/AAPL`
4. **Test Chat Service**: POST `/api/v1/chat/sessions`

### Phase 3: Real Data Validation
1. **Compare Mock vs Real**: Verify data structure matches
2. **Test Error Handling**: Invalid symbols, rate limits
3. **Performance Testing**: Response times with real APIs

## 🛠️ Troubleshooting

### Common Issues

**"API key not found" Error**:
```bash
# Check if .env file exists and has correct keys
cat apps/backend/.env | grep API_KEY

# Restart backend after adding keys
pkill -f "nest start"
cd apps/backend && npm run start:dev
```

**"Rate limit exceeded" Error**:
```bash
# Check your API usage quotas
# For SerpApi: https://serpapi.com/dashboard
# For Claude: https://console.anthropic.com/
# For FRED: No rate limits, but check key validity
```

**"Invalid response format" Error**:
```bash
# Test API directly to see actual response
curl -v "https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=YOUR_KEY&file_type=json&limit=1"
```

### API-Specific Troubleshooting

**FRED API Issues**:
- ✅ Check email for API key confirmation
- ✅ Ensure series ID is correct (CPIAUCSL, FEDFUNDS, UNRATE)
- ✅ Verify file_type=json parameter

**SerpApi Issues**:  
- ✅ Check remaining search credits in dashboard
- ✅ Verify query format (e.g., "AAPL:NASDAQ")
- ✅ Test with different stock symbols

**Claude API Issues**:
- ✅ Ensure API key starts with "sk-ant-"
- ✅ Check billing/credits in console
- ✅ Verify model name (claude-3-sonnet-20240229)
- ✅ Include required headers (anthropic-version)

## 💰 Cost Estimation

**Development Testing (1 month)**:
- **FRED API**: Free
- **SerpApi**: Free (100 searches/month)
- **Claude API**: $5-15 (depending on usage)

**Production Usage (estimated monthly)**:
- **FRED API**: Free
- **SerpApi**: $25-50 (1000+ searches)  
- **Claude API**: $50-200 (depending on chat volume)

## 📈 Performance Benchmarks

**Target Response Times (with real APIs)**:
- Market Summary: < 3 seconds (multiple API calls)
- Individual Stock: < 2 seconds  
- Chat Response: < 5 seconds (AI processing)
- Economic Data: < 1 second (cached after first call)

**Success Rates**:
- FRED API: 99.9% uptime
- SerpApi: 99.5% uptime  
- Claude API: 99.0% uptime

## 🎯 Next Steps After API Testing

1. **Frontend Integration**: Use confirmed API structures
2. **Production Deployment**: Set up production API keys
3. **Monitoring**: Implement API usage tracking
4. **Scaling**: Consider API rate limits for production
5. **Caching**: Optimize API call frequency

---

**Ready to test with real APIs! 🚀**

Use the provided scripts and commands to validate each API key and ensure BE2 services work with live data.