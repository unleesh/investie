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

Core development commands available from the root package.json:

```bash
# Start all development servers concurrently
npm run dev

# Start individual services
npm run dev:mobile    # React Native/Expo (expo start)
npm run dev:web       # Next.js development server with Turbopack
npm run dev:backend   # NestJS backend (nest start --watch)

# Build commands
npm run build         # Build all packages and apps
npm run build:packages # Build shared packages
npm run build:apps    # Build frontend and backend apps

# Testing & Quality
npm run test          # Run tests for all packages and apps
npm run typecheck     # Type check all packages and apps
npm run lint          # Run ESLint for web and backend

# Maintenance
npm run clean         # Clean dist and node_modules
npm run install:all   # Install dependencies for all workspaces

# Backend Testing (Individual Commands)
cd apps/backend && npm run test          # Unit tests
cd apps/backend && npm run test:e2e      # End-to-end tests
cd apps/backend && npm run test:cov      # Coverage report
cd apps/backend && npm run start:prod    # Production build

# Frontend Testing
cd apps/web && npx tsc --noEmit          # Web typecheck only
cd apps/web && npm run lint              # Web linting only

# Package Testing (Individual)
cd packages/types && npm test            # Types package tests
cd packages/mock && npm test             # Mock data tests
cd packages/utils && npm test            # Utils package tests

# API Testing
./test_endpoints.sh                      # Test all backend endpoints (requires backend running)
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

**Backend Testing**: Use `./test_endpoints.sh` to validate all endpoints. Requires backend running on localhost:3000.

**Backend Port**: Default port 3000, configurable via PORT environment variable.

**Service Architecture**:
- **Market Service** (`market/`): FRED API + SerpApi integration for economic indicators
- **Stocks Service** (`stocks/`): Google Finance via SerpApi for real-time stock data
- **AI Service** (`ai/`): Claude API integration for evaluations and analysis
- **Chat Service** (`chat/`): AI chatbot with session management
- **External Services** (`services/`): FRED and SerpApi client implementations

## Backend Implementation Status

✅ **COMPLETE**: All backend features are fully implemented including:
- Financial data services with FRED API and SerpApi Google Finance integration
- AI services with Claude API integration for evaluations and chat
- Redis caching strategy (24h for economic data, 12h for AI content, 6h for news, 1h for chat)
- Complete fallback system with comprehensive mock data
- All 10 target stocks with integrated AI evaluations, news summaries, and technical analysis

## Frontend Development Guidelines

### Component Architecture
- Mobile and web apps share identical component APIs for maximum code reusability
- Chart components use Recharts library
- Mobile: React Native with NativeWind for styling (Expo ~53)
- Web: Next.js 15.4.5 App Router with Tailwind CSS 4.x

### Key Components (Already Scaffolded)
- **MarketSummaryCard**: Display market overview with AI-enhanced data
- **StockCard**: Reusable component for individual stock data with price charts and AI evaluations
- **StockPriceChart**: Historical price visualization
- **AIEvaluationCard**: Display AI analysis with rating, confidence, and key factors
- **AIChatbot**: Investment assistant (web: right sidebar, mobile: modal/bottom sheet)
- **LineChart**: Generic chart component for various data visualizations

### Layout Structure
- **Desktop**: Three-column layout (main content, watchlist widget, AI chatbot sidebar)
- **Mobile**: Vertical scrolling with watchlist in header dropdown and chatbot as floating button/modal

### Shared Dependencies
All apps reference shared packages via file: protocol:
- `@investie/types`: Complete TypeScript definitions
- `@investie/mock`: JSON mock data with utility functions
- `@investie/utils`: Formatter utilities for currency, percentages, dates

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
SERPAPI_API_KEY=your-serpapi-key             # For Google Finance data via SerpApi
FRED_API_KEY=your-fred-api-key              # For economic indicators (CPI, Interest Rate, Unemployment)
```

## Code Style Guidelines

- All type definitions must be added to `packages/types` first (single source of truth)
- Use shared mock data from `packages/mock` for development
- Frontend components should accept typed props based on shared interfaces
- Implement responsive design using shared Tailwind/NativeWind configuration
- Chart components should use Recharts for consistency across platforms

## Workspace Dependencies

The project uses npm workspaces with local file: dependencies for maximum development flexibility:

```json
// Example from apps/backend/package.json
{
  "dependencies": {
    "@investie/types": "file:../../packages/types",
    "@investie/mock": "file:../../packages/mock", 
    "@investie/utils": "file:../../packages/utils"
  }
}
```

**Important**: After making changes to shared packages, run `npm run build:packages` to ensure TypeScript builds are updated.

**Package Build Order**:
1. `packages/types` - Must be built first (other packages depend on it)
2. `packages/utils` - Can be built after types
3. `packages/mock` - Can be built independently
4. Apps consume the built packages via file: protocol

## Technology Stack Details

**Backend (NestJS)**:
- Framework: NestJS 11.x with Express
- Testing: Jest with coverage support
- External APIs: SerpApi (Google Finance), FRED API, Claude AI
- Validation: Joi for request validation
- HTTP Client: Axios for external API calls

**Web Frontend (Next.js)**:
- Framework: Next.js 15.4.5 with App Router
- Styling: Tailwind CSS 4.x
- Development: Turbopack for fast development builds
- React: Version 19.x

**Mobile Frontend (React Native/Expo)**:
- Framework: Expo ~53.0.20
- React Native: 0.79.5
- Styling: NativeWind (planned)
- Platform: Cross-platform iOS/Android

**Shared Packages**:
- TypeScript 5.x across all packages
- Testing: Vitest for packages, Jest for backend
- Build: Native TypeScript compilation

**Development Environment**:
- Node.js >=18.0.0, npm >=9.0.0
- Nx workspace for tooling (version 21.3.11)
- Concurrent development with `concurrently` package

## Current Focus

The backend is complete and ready for frontend development. Priority should be on building the MarketSummaryCard and StockCard components using the fully functional API endpoints or falling back to comprehensive mock data during development.

## Common Troubleshooting

**Build Issues**: Run `npm run clean` followed by `npm run install:all` to reset dependencies.

**Backend Not Starting**: Ensure port 3000 is available or set PORT environment variable.

**Package Import Errors**: Rebuild shared packages with `npm run build:packages`.

**API Connection Issues**: Check if required API keys are set in environment variables.

**Type Errors**: Run `npm run typecheck` to identify TypeScript issues across all packages.