# Investie Backend - News Module

## Overview

This is the **News Processing Module** for the Investie backend application. It implements a complete sequential workflow for fetching, analyzing, and generating investment insights from news data.

## 🎯 My Focus: News Loading & Overview Generation

This module handles two core responsibilities:

### 1. **News Loading System** 📰
- Fetches real-time news data from multiple sources
- Implements intelligent caching to avoid redundant API calls
- Stores structured news data in JSON format

### 2. **AI-Powered Overview Generation** 🧠
- Analyzes news content using multiple AI services (Claude API, OpenAI GPT-4.1)
- Generates investment recommendations (BUY/HOLD/SELL)
- Creates comprehensive stock analysis paragraphs

## 🔄 Sequential Workflow

The news module follows this exact 6-step process:

```
1. User Input Stock Code (e.g., "AAPL")
    ↓
2. Validate Stock Code Format & Existence
    ↓
3. If Invalid → Stop & Return Error + Suggestions
    ↓
4. If Valid → Check Existing News Data (Macro + Stock)
    ↓
5. If Missing → Load Fresh News & Store as JSON
    ↓
6. Generate AI Overview Paragraph & Store Result
```

## 📊 News Data Sources

### Macro News (Market-Wide)
- **Query**: "stock market economy finance business"
- **Source**: Google News via SerpAPI
- **Articles**: Up to 100 general market articles
- **Storage**: `data/news/macro_news/{date}`

### Stock-Specific News
- **Query**: "{CompanyName} {Symbol} stock" (e.g., "Apple AAPL stock")
- **Source**: Google News via SerpAPI
- **Articles**: Targeted company news
- **Storage**: `data/news/stock_news/{symbol}`

## 🧠 AI Overview Generation

### Multi-Tier Sentiment Analysis
1. **Claude API** (Primary) - Most sophisticated analysis
2. **OpenAI API** (Fallback) - Reliable backup
3. **Keyword Analysis** (Last Resort) - Simple but functional

### Overview Content
Generated paragraphs include:
- **Investment Recommendation**: BUY/HOLD/SELL
- **Confidence Score**: 0-100%
- **Risk Assessment**: LOW/MEDIUM/HIGH
- **Key Factors**: Important news highlights
- **Time Horizon**: Investment timeline (1-3, 3-6, 6-12 months)

## 🚀 Quick Start

### Environment Setup
```bash
# Required API Keys
SERPAPI_API_KEY=your-serpapi-key          # For Google News
CLAUDE_API_KEY=your-claude-api-key        # Primary AI analysis
OPENAI_API_KEY=your-openai-api-key        # Fallback AI analysis
```

### Installation & Testing
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the news workflow
node test-news-e2e.js
```

## 📋 API Usage

### Process Stock News
```bash
POST /news/process
```

**Request:**
```json
{
  "symbol": "AAPL"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "overview": {
      "overview": "Based on recent analysis, AAPL shows positive sentiment with strong market conditions...",
      "recommendation": "BUY",
      "confidence": 85,
      "keyFactors": [
        "Strong Q3 earnings beat expectations",
        "Positive analyst upgrades"
      ],
      "riskLevel": "MEDIUM",
      "timeHorizon": "3-6 months",
      "timestamp": "2025-08-05T..."
    }
  }
}
```

**Error Response (Invalid Symbol):**
```json
{
  "success": false,
  "error": "Invalid stock symbol: Invalid format",
  "suggestions": ["AAPL", "TSLA", "MSFT"]
}
```

## 📂 Data Structure

```
data/news/
├── macro_news/
│   └── 2025-08-06              # Daily market news cache
└── stock_news/
    ├── AAPL/                   # Apple news cache
    │   └── 2025-08-06          # Daily Apple news
    ├── TSLA/                   # Tesla news cache
    │   └── 2025-08-06          # Daily Tesla news
    └── NVDA/                   # NVIDIA news cache
        └── 2025-08-06          # Daily NVIDIA news
```

**Sample News Data:**
```json
{
  "headline": "Apple Reports Record Q3 Earnings",
  "sentiment": "positive",
  "source": "google_news + ai_sentiment",
  "timestamp": "2025-08-05T..."
}
```

## 🧪 Testing

### Run Complete Workflow Test
```bash
node test-news-e2e.js
```

**Test Cases:**
- ✅ Valid known symbol (AAPL)
- ❌ Invalid symbol format (returns suggestions)
- ✅ Valid new symbol (fetches fresh data)
- 📁 Cached data usage (when available)

## 🔍 Supported Stock Symbols

### Major Tech Stocks
- **AAPL** (Apple), **MSFT** (Microsoft), **GOOGL** (Google)
- **TSLA** (Tesla), **NVDA** (NVIDIA), **META** (Meta)
- **AMZN** (Amazon), **NFLX** (Netflix)

### Traditional Stocks
- **JPM** (JPMorgan), **BAC** (Bank of America)
- **JNJ** (Johnson & Johnson), **PFE** (Pfizer)

### ETFs
- **SPY**, **QQQ**, **VTI**

*Plus format validation for any 1-5 letter stock symbols*

## ⚡ Performance Features

- **Smart Caching**: Avoids redundant API calls
- **Fast Validation**: Known symbols checked first
- **Graceful Fallbacks**: Multiple AI services for reliability
- **Error Recovery**: Helpful suggestions for invalid inputs

## 🔧 Technical Implementation

### Key Files
```
src/news/
├── news.service.ts             # Core workflow logic
├── news.controller.ts          # HTTP API endpoints
├── stock-validator.helper.ts   # Symbol validation
└── news.module.ts             # Module configuration
```

### External APIs
- **SerpAPI**: Google News data fetching
- **Claude API**: Primary sentiment analysis
- **OpenAI API**: Fallback sentiment analysis

This news module provides the foundation for intelligent investment decision-making by combining real-time news data with sophisticated AI analysis.
