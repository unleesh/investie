# BE2 (News & AI) Services Testing Guide

Complete testing guide for BE2 services including Chat, AI Evaluation, and Stock Integration.

## 🎯 Overview

BE2 handles the AI and news-related functionality in the Investie platform:
- **Chat Service**: AI chatbot for investment assistance
- **AI Evaluation Service**: Stock analysis and recommendations  
- **Stock Integration**: Combining BE1 financial data with AI insights
- **News Processing**: Market news summarization

## 🧪 Testing Methods

### Method 1: Quick Manual Test (Recommended)

Run the simplified test script that demonstrates all BE2 functionality:

```bash
# Run the manual test script
node test_be2_manual.js
```

This script simulates all BE2 services without requiring a running backend and shows:
- ✅ AI evaluation generation
- ✅ Chat session management
- ✅ BE1 + BE2 data integration
- ✅ Error handling mechanisms

### Method 2: Full Backend Integration Test

If you want to test with the actual backend running:

#### Step 1: Prepare Environment

```bash
# Build shared packages first
npm run build:packages

# Set up environment variables (optional for mock testing)
cp apps/backend/.env.example apps/backend/.env
```

#### Step 2: Start Backend

```bash
# Navigate to backend directory
cd apps/backend

# Start in development mode
npm run start:dev
```

#### Step 3: Run Integration Tests

```bash
# Wait for backend to start (about 10 seconds)
# Then run the full test suite
./test_be2_services.sh
```

## 📝 Manual API Testing

If you prefer to test the APIs manually, here are the key endpoints:

### Chat Service Endpoints

```bash
# Test chat health
curl -s http://localhost:3000/api/v1/chat/health

# Create a new chat session
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/v1/chat/sessions | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"

# Send a message
curl -s -X POST http://localhost:3000/api/v1/chat/sessions/$SESSION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the current market outlook?"}' | jq

# Get session history
curl -s http://localhost:3000/api/v1/chat/sessions/$SESSION_ID | jq

# Get all recent sessions
curl -s http://localhost:3000/api/v1/chat/sessions | jq

# End session
curl -s -X DELETE http://localhost:3000/api/v1/chat/sessions/$SESSION_ID
```

### Stock Integration Endpoints

```bash
# Get all stocks (with AI evaluations)
curl -s http://localhost:3000/api/v1/stocks | jq

# Get individual stock with AI analysis
curl -s http://localhost:3000/api/v1/stocks/AAPL | jq

# Get stock chart data
curl -s "http://localhost:3000/api/v1/stocks/AAPL/chart?period=1W" | jq

# Test different stocks
for symbol in TSLA MSFT GOOGL; do
  echo "Testing $symbol..."
  curl -s http://localhost:3000/api/v1/stocks/$symbol | jq -r '.symbol + ": " + .aiEvaluation.rating'
done
```

## 🔍 What to Look For

### ✅ Successful Test Indicators

**Chat Service:**
- Session creation returns valid `sessionId`
- Messages return structured AI responses
- Session retrieval shows message history
- Health endpoint returns status "ok"

**AI Evaluation Service:**
- Each stock has `aiEvaluation` object with:
  - `rating`: "bullish", "neutral", or "bearish"
  - `confidence`: Number between 0-100
  - `keyFactors`: Array of analysis points
  - `summary`: Text description

**Stock Integration:**
- Stock data includes both BE1 (financial) and BE2 (AI/news) data
- `price` object has current market data
- `newsSummary` has headline and sentiment
- `aiEvaluation` provides investment insights

### ⚠️ Expected Limitations (Current Phase)

**Mock AI Responses:**
- Chat responses are templated, not real AI
- AI evaluations use structured mock data
- News summaries are basic transformations

**API Dependencies:**
- Some endpoints may fail without proper API keys
- Fallback to mock data is expected behavior
- Caching may show stale data

## 🛠️ Troubleshooting

### Backend Won't Start

```bash
# Check for build errors
npm run build

# Clear cache and reinstall
npm run clean
npm install

# Check logs
tail -f /tmp/backend.log
```

### API Endpoints Return Errors

```bash
# Verify backend is running
curl http://localhost:3000/api/v1/health

# Check if packages are built
npm run build:packages

# Restart backend
pkill -f "nest start"
cd apps/backend && npm run start:dev
```

### Import/Module Errors

```bash
# Rebuild shared packages
npm run build:packages

# Clear node_modules and reinstall
rm -rf node_modules apps/backend/node_modules
npm install
```

## 📊 Testing Results Interpretation

### Service Status Levels

**🟢 Fully Operational**
- All endpoints respond correctly
- Data structures match TypeScript interfaces
- Error handling works as expected

**🟡 Limited Functionality** 
- Mock data instead of real AI responses
- Basic news processing (expected)
- Some API endpoints may use fallbacks

**🔴 Needs Attention**
- Endpoints returning 404/500 errors
- Invalid data structures
- Backend startup failures

## 🎯 Next Steps After Testing

### For Developers

1. **Frontend Integration**: Use the confirmed API endpoints
2. **Real AI Integration**: Plan Claude API implementation
3. **Enhanced Features**: Add advanced AI capabilities

### For Phase 2 Implementation

1. **Claude API Integration**: Replace mock AI with real responses
2. **News Intelligence**: Implement smart news summarization  
3. **Market Insights**: Add Fear & Greed Index real-time data
4. **Advanced Analytics**: Enhanced AI-powered recommendations

## 🚀 Quick Start Commands

```bash
# Complete BE2 testing in 3 commands:

# 1. Quick functionality test
node test_be2_manual.js

# 2. Backend integration test (optional)
npm run build:packages && cd apps/backend && npm run start:dev &
sleep 10 && ./test_be2_services.sh

# 3. Manual API exploration (if backend running)
curl -s http://localhost:3000/api/v1/chat/health
curl -s http://localhost:3000/api/v1/stocks/AAPL | jq '.aiEvaluation'
```

## 📞 Support

If you encounter issues:

1. **Check Prerequisites**: Ensure Node.js >=18, npm >=9
2. **Review Logs**: Check `/tmp/backend.log` for errors
3. **Verify Packages**: Run `npm run build:packages`
4. **Test Manually**: Use the manual test script first
5. **Environment**: Ensure you're in the project root directory

---

**BE2 Services are ready for frontend integration and Phase 2 AI enhancements!** 🎉