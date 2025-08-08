# Mock Data Update Guide

## Overview

This guide explains how to update Investie's mock data with real financial information from external APIs while preserving BE1 compatibility and maintaining test stability.

## 🔧 Setup

### Required API Keys

Create a `.env` file in the root directory with:

```env
FRED_API_KEY=your_fred_api_key_here
SERPAPI_API_KEY=your_serpapi_key_here  
CLAUDE_API_KEY=your_claude_api_key_here
```

### API Key Sources

1. **FRED API** (Federal Reserve Economic Data)
   - Sign up at: https://fred.stlouisfed.org/docs/api/api_key.html
   - Used for: CPI, Interest Rates, Unemployment Rate

2. **SerpApi** (Google Finance)
   - Sign up at: https://serpapi.com/
   - Used for: Stock prices, market data, S&P 500

3. **Claude API** (Anthropic)
   - Sign up at: https://console.anthropic.com/
   - Used for: AI stock evaluations, interest rate outlook

## 🚀 Usage

### Update Mock Data

```bash
# Install dependencies (if not already installed)
npm install

# Update all mock data with real API data
npm run update-mock-data
```

### Verify Changes

```bash
# Run tests to ensure no breaking changes
npm run test:packages

# Build packages to validate TypeScript compatibility  
npm run build:packages

# Optional: Start backend to test API integration
npm run dev:backend
```

## 📊 Data Sources & Mapping

### Market Summary Data

| Field | Source | API Endpoint | Fallback |
|-------|--------|--------------|----------|
| CPI | FRED API | `/series/observations?series_id=CPIAUCSL` | Static mock |
| Interest Rate | FRED API | `/series/observations?series_id=FEDFUNDS` | Static mock |
| Unemployment | FRED API | `/series/observations?series_id=UNRATE` | Static mock |
| VIX | Generated | Based on market volatility algorithm | Static mock |
| Fear & Greed | Generated | Correlated with VIX (inverse relationship) | Static mock |
| S&P 500 | SerpApi | Google Finance `SPY` query | Static mock |
| Interest Rate Outlook | Claude AI | AI-generated analysis based on current rates | Static text |

### Stock Data (10 Symbols)

For each stock symbol (`AAPL`, `TSLA`, `MSFT`, `GOOGL`, `AMZN`, `NVDA`, `META`, `NFLX`, `AVGO`, `AMD`):

| Field | Source | Method | Fallback |
|-------|--------|--------|----------|
| Current Price | SerpApi | Google Finance stock query | Random generation |
| Price Change | SerpApi | Calculated from current vs previous close | Random generation |
| Fundamentals (P/E, Market Cap) | SerpApi | Google Finance summary data | Random generation |
| AI Evaluation | Claude AI | AI analysis of stock data + market conditions | Preset evaluations |
| Price Chart (1W) | Generated | Based on current price with realistic variation | Static mock |
| News Summary | Generated | AI-processed summary of recent developments | Static text |
| Technical Indicators | Generated | RSI, MACD, Support/Resistance based on price | Static mock |

## ⚠️ BE1 Compatibility

The update script preserves BE1 integration by:

1. **Maintaining Data Structure**: All JSON schemas remain identical to existing mock data
2. **Preserving Test Cases**: Unit tests continue to pass without modification
3. **Keeping Source Attribution**: `source` fields maintain expected values (`fred_api`, `google_finance`, `claude_ai`)
4. **Type Safety**: TypeScript interfaces remain unchanged

### Protected Elements

- Market controller endpoints (`/api/v1/market-summary`)
- Service class implementations in `apps/backend/src/`
- Export functions in `packages/mock/src/index.ts`
- Test expectations in `packages/mock/src/index.test.ts`

## 📈 Data Freshness

### Update Frequency Recommendations

- **Development**: Run `npm run update-mock-data` daily or before major development sessions
- **Production**: BE1 backend handles live data; mock updates are for development only
- **Testing**: Mock data should be updated when test cases fail due to stale data

### Rate Limiting

The script includes built-in rate limiting:
- 1 second delay between stock API calls
- Batch processing for economic indicators
- Error handling with fallback to existing data

## 🧪 Testing Integration

### Automated Validation

The update script includes validation for:
- API response structure compatibility
- TypeScript type checking
- Mock data schema validation
- Test case data expectations

### Manual Verification

After updating mock data:

```bash
# 1. Verify types compile
npm run typecheck

# 2. Run all tests
npm run test

# 3. Start backend and test endpoints
npm run dev:backend
./test_endpoints.sh
```

## 🔍 Troubleshooting

### Common Issues

**API Key Errors**
```
Error: Missing required environment variables: FRED_API_KEY
```
Solution: Ensure all API keys are set in `.env` file

**Rate Limiting**
```
Error: 429 Too Many Requests
```
Solution: Script includes automatic rate limiting; wait and retry

**Schema Validation Errors**
```
Error: Mock data structure doesn't match types
```
Solution: Check that API responses match expected TypeScript interfaces

**Test Failures After Update**
```
Error: Expected value X but received Y
```
Solution: Update test expectations in `*.test.ts` files if data ranges changed

### Fallback Behavior

If any API fails, the script:
1. Logs the error with context
2. Falls back to realistic generated data
3. Maintains existing mock data structure
4. Continues processing other data sources

## 🏗️ Architecture Notes

### Script Design

- **Modular**: Separate API clients for each service (FRED, SerpApi, Claude)
- **Resilient**: Comprehensive error handling and fallback strategies  
- **Type-Safe**: Full TypeScript integration with existing interfaces
- **Testable**: Validation logic ensures compatibility

### Integration Points

- `packages/mock/src/*.json` - Updated data files
- `packages/types/src/index.ts` - Shared type definitions (unchanged)
- `apps/backend/src/services/` - BE1 service implementations (unchanged)
- Unit tests validate data structure compatibility

### Future Enhancements

- Configurable update schedules
- Historical data tracking
- Data quality metrics
- Custom fallback data sources

## 📝 Maintenance

### Regular Tasks

1. **Monthly**: Review API key usage and quotas
2. **Weekly**: Update mock data for active development
3. **Release**: Ensure latest mock data before major releases

### Monitoring

Watch for:
- API deprecation notices
- Rate limit changes
- Schema modifications in external APIs
- Test failures indicating stale expectations