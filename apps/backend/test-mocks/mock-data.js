// Mock data for Jest E2E tests
// This file replaces @investie/mock package for testing

const marketSummaryData = {
  "fearGreedIndex": { 
    "value": 38, 
    "status": "fear", 
    "source": "claude_search" 
  },
  "vix": { 
    "value": 17.5, 
    "status": "medium", 
    "source": "google_finance" 
  },
  "interestRate": { 
    "value": 5.33, 
    "aiOutlook": "Fed rate expected to hold steady through the next quarter amid persistent inflation concerns.", 
    "source": "fred_api" 
  },
  "cpi": { 
    "value": 3.4, 
    "monthOverMonth": 0.1, 
    "direction": "up", 
    "source": "fred_api" 
  },
  "unemploymentRate": { 
    "value": 3.9, 
    "monthOverMonth": 0.1, 
    "source": "fred_api" 
  },
  "sp500Sparkline": { 
    "data": [4780, 4785, 4790, 4770, 4795, 4805, 4800], 
    "weeklyTrend": "up", 
    "source": "google_finance" 
  }
};

const stocksData = {
  "AAPL": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": {
      "current": 195.89,
      "change": 2.34,
      "changePercent": 1.21,
      "source": "google_finance"
    },
    "priceChart": {
      "period": "1W",
      "data": [
        { "timestamp": "2025-01-27T16:00:00Z", "price": 192.45 },
        { "timestamp": "2025-01-28T16:00:00Z", "price": 193.21 },
        { "timestamp": "2025-01-29T16:00:00Z", "price": 191.78 },
        { "timestamp": "2025-01-30T16:00:00Z", "price": 194.12 },
        { "timestamp": "2025-01-31T16:00:00Z", "price": 193.55 },
        { "timestamp": "2025-02-03T16:00:00Z", "price": 195.89 }
      ],
      "trend": "up",
      "change": 3.44,
      "changePercent": 1.79,
      "source": "google_finance"
    },
    "fundamentals": {
      "pe": 28.5,
      "marketCap": 3050000000000,
      "volume": 45680000,
      "fiftyTwoWeekHigh": 199.62,
      "fiftyTwoWeekLow": 164.08,
      "source": "google_finance"
    },
    "technicals": {
      "rsi": 62,
      "rsiStatus": "neutral"
    },
    "aiEvaluation": {
      "summary": "Apple maintains strong fundamentals with robust ecosystem growth and Services revenue expansion. Vision Pro represents significant innovation catalyst despite initial supply constraints.",
      "rating": "bullish",
      "confidence": 85,
      "keyFactors": ["Services revenue growth", "Vision Pro market potential", "iPhone upgrade cycle", "Strong cash position"],
      "timeframe": "3M",
      "source": "claude_ai",
      "lastUpdated": "2025-02-03T10:30:00Z"
    },
    "newsSummary": {
      "headline": "Analysts remain bullish on Vision Pro sales projections despite initial supply chain concerns.",
      "sentiment": "positive",
      "source": "google_news + claude_ai"
    },
    "sectorPerformance": {
      "name": "Technology",
      "weeklyChange": 2.1,
      "source": "google_finance"
    }
  }
};

// Export functions matching the original @investie/mock interface
module.exports = {
  marketSummary: marketSummaryData,
  stocks: stocksData,
  getMarketSummary: () => marketSummaryData,
  getStock: (symbol) => stocksData[symbol],
  getAllStocks: () => Object.values(stocksData),
  getStocksBySymbols: (symbols) => symbols.map(symbol => stocksData[symbol]).filter(Boolean),
  marketSummaryMock: marketSummaryData,
  stocksMock: stocksData
};