# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Investie is a comprehensive investment assistant application with mobile (React Native/Expo) and web (Next.js 14) frontends, powered by a NestJS backend. The project follows a monorepo architecture using Nx workspaces with shared types, mock data, and utilities.

## Architecture

```
investie/
├── apps/
│   ├── mobile/        # React-Native (Expo) Application
│   ├── web/           # Next.js 14 Application  
│   └── backend/       # NestJS API Server
├── packages/
│   ├── types/         # Shared TypeScript Types (Single Source of Truth)
│   ├── mock/          # Shared Mock Data (JSON files)
│   └── utils/         # Shared Helper Functions
```

## Development Commands

Since no package.json was found, these are the expected commands based on the documentation:

```bash
# Start all development servers concurrently
npm run dev

# Start individual services
npm run dev:mobile    # React Native/Expo
npm run dev:web       # Next.js development server  
npm run dev:backend   # NestJS backend

# Type checking
npm run typecheck
```

## Core Data Types

The project uses shared TypeScript interfaces in `packages/types/src/index.ts`:

- **MarketSummaryData**: Market overview with Fear & Greed Index, VIX, interest rates, CPI, unemployment, S&P500 sparkline
- **StockCardData**: Individual stock data including price charts, fundamentals, technicals, AI evaluations, and news
- **AIEvaluation**: Comprehensive AI stock analysis with rating, confidence, and key factors
- **ChatMessage/ChatSession**: AI chatbot system for investment assistance
- **StockSymbol**: Limited to 10 target stocks (AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META, NFLX, AVGO, AMD)

## Backend API Endpoints

The backend provides these fully implemented endpoints:

```bash
# Market Data (AI Enhanced)
GET /api/v1/market-summary                    # Market data with AI Fear & Greed + Interest Rate Outlook
GET /api/v1/health                           # Backend health check

# Stock Data (Fully Integrated)
GET /api/v1/stocks                           # All 10 stocks with complete data
GET /api/v1/stocks/:symbol                   # Individual stock with AI evaluation + news + RSI  
GET /api/v1/stocks/:symbol/chart?period=1W   # Historical chart data (1D, 1W, 1M, 3M, 1Y)

# AI Chatbot System
POST /api/v1/chat/sessions                   # Create new chat session
POST /api/v1/chat/sessions/:id/messages      # Send message to AI
GET  /api/v1/chat/sessions/:id               # Get session history
GET  /api/v1/chat/sessions                   # List recent sessions
DELETE /api/v1/chat/sessions/:id             # End session
GET /api/v1/chat/health                      # Chat service health
```

## Backend Implementation Status

✅ **COMPLETE**: All backend features are fully implemented including:
- Financial data services with FRED API and Google Finance integration
- AI services with Claude API integration for evaluations and chat
- Redis caching strategy (24h for economic data, 12h for AI content, 6h for news, 1h for chat)
- Complete fallback system with comprehensive mock data
- All 10 target stocks with integrated AI evaluations, news summaries, and technical analysis

## Frontend Development Guidelines

### Component Architecture
- Mobile and web apps share identical component APIs for maximum code reusability
- Chart components use Recharts library
- Mobile: React Native with NativeWind for styling
- Web: Next.js 14 App Router with Tailwind CSS

### Key Components to Implement
- **MarketSummaryCard**: Display market overview with AI-enhanced data
- **StockCard**: Reusable component for individual stock data with price charts and AI evaluations
- **StockPriceChart**: Historical price visualization
- **AIEvaluationCard**: Display AI analysis with rating, confidence, and key factors
- **AIChatbot**: Investment assistant (web: right sidebar, mobile: modal/bottom sheet)

### Layout Structure
- **Desktop**: Three-column layout (main content, watchlist widget, AI chatbot sidebar)
- **Mobile**: Vertical scrolling with watchlist in header dropdown and chatbot as floating button/modal

## Team Development Strategy

The project follows a "Vibe Coding" approach with phased development:
- **Phase 0**: Complete monorepo skeleton with shared types and mock data ✅
- **Phase 1**: Build Market Summary Card (first feature slice) 
- **Phase 2**: Create reusable Stock Card foundation
- **Phase 3**: Implement all 10 stock cards in parallel
- **Phase 4**: Add authentication and personalized watchlist management

## Required API Keys (Production)

```bash
CLAUDE_API_KEY=your-claude-api-key           # For AI evaluations and chat
GOOGLE_NEWS_API_KEY=your-news-api-key        # For news summaries
GOOGLE_FINANCE_API_KEY=your-finance-api-key  # For stock/market data
FRED_API_KEY=your-fred-api-key              # For economic indicators
```

## Code Style Guidelines

- All type definitions must be added to `packages/types` first (single source of truth)
- Use shared mock data from `packages/mock` for development
- Frontend components should accept typed props based on shared interfaces
- Implement responsive design using shared Tailwind/NativeWind configuration
- Chart components should use Recharts for consistency across platforms

## Current Focus

The backend is complete and ready for frontend development. Priority should be on building the MarketSummaryCard and StockCard components using the fully functional API endpoints or falling back to comprehensive mock data during development.