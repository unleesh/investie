# News Service Module

## Overview

The News Service module provides real-time stock news integration using SerpAPI's Google News API. When a stock symbol is requested, it fetches the latest news articles and performs basic sentiment analysis.

## Files Structure

```
src/news/
├── README.md           # This file
├── news.service.ts     # Main service logic
└── news.module.ts      # NestJS module configuration
```

## How It Works

### 1. News Fetching Flow
```
Stock Request → NewsService.getStockNews() → SerpAPI → Google News → Sentiment Analysis → Response
```

### 2. Example Request Process
1. User requests: `GET /api/v1/stocks/AAPL`
2. StocksService calls `newsService.getStockNews('AAPL')`
3. NewsService queries SerpAPI with: `"Apple AAPL stock"`
4. Gets back news articles from Google News
5. Takes the top article headline
6. Analyzes sentiment using keyword matching
7. Returns structured news summary

## API Integration

### SerpAPI Configuration
- **Endpoint**: `https://serpapi.com/search`
- **Engine**: `google_news`
- **Query Format**: `"{CompanyName} {SYMBOL} stock"`
- **Parameters**:
  - `gl=us` (country: United States)
  - `hl=en` (language: English)
  - `api_key` (from environment variable)

### Environment Setup
```bash
# Required in .env file
SERPAPI_API_KEY=your-serpapi-key-here

# Optional AI API Keys (for sentiment analysis)
CLAUDE_API_KEY=your-claude-api-key-here    # Primary AI sentiment
OPENAI_API_KEY=your-openai-api-key-here    # Fallback AI sentiment
# Note: Service works with any combination of these keys
```

## Sentiment Analysis

**Three-Tier AI System** - The service uses a sophisticated fallback hierarchy for maximum reliability.

### Sentiment Analysis Hierarchy
1. **🥇 Primary**: Claude 3 Sonnet (most accurate)
2. **🥈 Secondary**: OpenAI GPT-3.5-turbo (fast fallback)  
3. **🥉 Final**: Keyword matching (always available)

### AI Integration Details

#### Claude API
- **Model**: `claude-3-sonnet-20240229`
- **Strengths**: Best context understanding, financial language expertise
- **Timeout**: 8 seconds

#### OpenAI API  
- **Model**: `gpt-3.5-turbo`
- **Strengths**: Fast, reliable, good accuracy
- **Timeout**: Default OpenAI timeout
- **Temperature**: 0 (deterministic responses)

#### Keyword Fallback
- **Positive**: `up, rise, gain, growth, surge, strong, beat, profit`
- **Negative**: `down, fall, drop, decline, loss, crash, weak, miss`
- **Logic**: Simple word matching with conflict resolution

### Advantages of Multi-AI Approach
- **🛡️ High Reliability**: Never fails to return sentiment
- **⚡ Speed**: Fastest available method is used
- **🎯 Accuracy**: AI analysis when available, keyword when not
- **💰 Cost Efficient**: Falls back when primary APIs have issues

## Company Name Mapping

The service maps stock symbols to company names for better search results:

```typescript
{
  AAPL: 'Apple',
  TSLA: 'Tesla', 
  MSFT: 'Microsoft',
  GOOGL: 'Google Alphabet',
  AMZN: 'Amazon',
  NVDA: 'NVIDIA',
  META: 'Meta Facebook',
  NFLX: 'Netflix',
  AVGO: 'Broadcom',
  AMD: 'AMD'
}
```

## Response Format

The service returns data matching the `StockNewsSummary` interface:

```typescript
{
  headline: string;           // Top news article title
  sentiment: 'positive' | 'neutral' | 'negative';
  source: 'google_news + claude_ai';
}
```

## Error Handling

### Graceful Fallbacks
1. **No API Key**: Returns `null`, logs warning
2. **API Error**: Returns `null`, logs error  
3. **No News Found**: Returns `null`, logs warning
4. **Network Timeout**: Returns `null` after 10 seconds

### Integration Safety
- StocksService catches all errors from NewsService
- Falls back to mock data if news loading fails
- Never breaks the main stock data response

## Testing

### Prerequisites
1. **Get SerpAPI Key** (Free):
   - Visit [serpapi.com](https://serpapi.com) and sign up
   - Get your free API key (100 searches/month)
   - Add it to your `.env` file: `SERPAPI_API_KEY=your-actual-key-here`

### Method 1: Quick API Test (Recommended)
```bash
# First, create the test file
cat > test-news-quick.js << 'EOF'
const axios = require('axios');
async function testNews() {
  const key = process.env.SERPAPI_API_KEY;
  if (!key || key === 'your-serpapi-key-here') {
    console.log('❌ Add real SERPAPI_API_KEY to .env first');
    return;
  }
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: { engine: 'google_news', q: 'Apple AAPL stock', api_key: key }
    });
    const news = response.data.news_results?.[0];
    console.log('✅ News API working!');
    console.log('📰 Latest:', news?.title);
    console.log('🔗 Source:', news?.source);
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}
testNews();
EOF

# Run the test
node test-news-quick.js
```

### Method 2: Backend Integration Test
```bash
# Step 1: Start the backend
npm run start:dev

# Step 2: Test the integrated endpoint (in another terminal)
curl -s "http://localhost:3001/api/v1/stocks/AAPL" | jq '{
  symbol: .symbol,
  name: .name,
  price: .price.current,
  news: .newsSummary
}'
```

**Expected output with API keys:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 195.50,
  "news": {
    "headline": "Apple Stock Rises After Strong iPhone Sales Report",
    "sentiment": "positive",   // ← Claude AI analyzed sentiment
    "source": "google_news + claude_ai"
  }
}
```

### Method 3: Multiple Stocks Test
```bash
# Test several stocks at once
for symbol in AAPL TSLA NVDA; do
  echo "Testing $symbol..."
  curl -s "http://localhost:3001/api/v1/stocks/$symbol" | jq '.newsSummary'
done
```

### Method 4: Detailed Article Analysis
```bash
# Use the detailed test script (already created)
node test-news-detailed.js
```
This shows:
- Multiple articles per stock
- Sentiment analysis breakdown
- Article sources and dates
- Raw API response structure

### Testing Without API Key
```bash
# Even without SerpAPI key, you can test the integration
curl "http://localhost:3001/api/v1/stocks/AAPL" | jq '.newsSummary'
```
Should return mock news data, proving the fallback system works.

### Troubleshooting Tests

#### Backend Not Starting?
```bash
# Check for module errors
npm run build

# If build fails, check the error logs
tail -f backend.log
```

#### API Key Issues?
```bash
# Verify your key is loaded
node -e "console.log('Key:', process.env.SERPAPI_API_KEY?.substring(0,10) + '...')"
```

#### Network Issues?
```bash
# Test basic connectivity
curl -s "https://serpapi.com/search?engine=google_news&q=test&api_key=YOUR_KEY" | head -20
```

### What to Look For

✅ **Success Indicators:**
- Fresh headlines (different from mock data)
- Proper sentiment detection (positive/negative/neutral)
- Current dates on articles
- Various news sources

❌ **Failure Indicators:**
- Same headlines as mock data (API key issue)
- "No news found" errors (network/quota issue)
- Timeout errors (connectivity issue)

## Usage in Application

### Backend Integration
```typescript
// In StocksService
const newsData = await this.newsService.getStockNews(symbol);
if (newsData) {
  return { ...stockData, newsSummary: newsData };
}
```

### Frontend Integration
```typescript
// The API response now includes:
{
  symbol: "AAPL",
  name: "Apple Inc.",
  // ... other stock data
  newsSummary: {
    headline: "Apple Stock Rises on Strong iPhone Sales",
    sentiment: "positive", 
    source: "google_news + claude_ai"
  }
}
```

## Configuration Notes

### Free Tier Limits
- SerpAPI offers 100 free searches per month
- Production apps should implement caching
- Consider upgrading for higher volume

### Rate Limiting
- Current implementation has 10-second timeout
- No built-in rate limiting (handled by SerpAPI)
- Falls back gracefully on quota exceeded

## Future Enhancements

### Potential Improvements
1. **Caching**: Add Redis caching for news (6-hour TTL as per CLAUDE.md)
2. **Multiple Sources**: Integrate additional news APIs
3. **Advanced Sentiment**: Use Claude API for better sentiment analysis
4. **News Filtering**: Filter out irrelevant articles
5. **Historical News**: Support for date-range queries

### Integration Points
- Could integrate with existing AI services for better sentiment
- Could use Redis cache like other services in the app
- Could add news-specific endpoints for more detailed queries

## Troubleshooting

### Common Issues
1. **"No news found"**: Stock symbol might be too specific, or no recent news
2. **API timeout**: Network issues or SerpAPI downtime
3. **Invalid API key**: Check .env file configuration
4. **Module import errors**: Ensure proper NestJS module imports

### Debug Logging
The service logs all important events:
- API key missing warnings
- News fetch errors  
- Empty result warnings
- Network timeouts

Check console output when running the backend for debugging information.