Investie: Detailed Development Guide for a 4-Person Team (Mobile + Desktop Web)
🎯 Objective of this Guide
This document provides a detailed development plan for a 4-person engineering team (2 Frontend, 2 Backend) to build the Investie MVP. It is designed to enable independent yet collaborative work, with all development based on the monorepo skeleton and mock data established in Phase 0.

Each phase is broken down into small, manageable modules, with the goal of incrementally completing working features.

👥 Team Role Definitions
Frontend 1 (FE1 - Graphs & Visualization): Responsible for developing charts and data visualization components. (For both Mobile & Web)

Frontend 2 (FE2 - UI/UX & Layout): Responsible for the overall layout, design system, data display, and user interactions. (For both Mobile & Web)

Backend 1 (BE1 - Financial Data): Responsible for Google Finance, FRED API integration, and related database and caching.

Backend 2 (BE2 - News & AI): Responsible for Google News, Claude API integration, and related AI summary and analysis logic.

🎉 Current Implementation Status Summary
✅ Phases 0-3 Complete
All core backend features are fully implemented and ready for frontend development.

BE1 + BE2 Integration Status
✅ AI-Enhanced Market Summary: Real-time Fear & Greed Index + AI-powered interest rate outlook.

✅ Fully Integrated Stock Cards: Price charts + AI comprehensive evaluation + news analysis + RSI.

✅ AI Chatbot System: Session-based investment assistant is fully implemented.

✅ Optimized Caching: Multi-tier caching strategy is complete for optimal performance.

✅ API Endpoints: All RESTful APIs for these features are finalized.

📋 Current API Endpoints
Bash

# Core Data (AI-Enhanced)
GET /api/v1/market-summary     # AI-enhanced market data
GET /api/v1/stocks             # All stocks (BE1+BE2 integrated)
GET /api/v1/stocks/:symbol     # Complete data for an individual stock

# AI Chatbot (Fully Implemented)
POST /api/v1/chat/sessions     # Create a new session
POST /api/v1/chat/sessions/:id/messages  # Send an AI message
GET  /api/v1/chat/sessions/:id # Get session history
🎯 Next Step: Phase 4 (Authentication & Personalization)
Goal: Implement user login functionality and a custom watchlist system.

Phase 1: Build the Market Summary Card (First Feature Slice)
Goal: To complete the first fully functional feature, the MarketSummaryCard, and validate the end-to-end data flow of the entire architecture.

Role	Tasks
FE1 (Graphs & Visualization)	1. Develop S&P500Sparkline Component: Use Recharts to create a sparkline chart that works on both mobile and web. It should accept props based on the MarketSummaryData type from packages/types.<br>2. Develop FearGreedGauge Component: Create a circular gauge component to visualize the Fear & Greed Index.
FE2 (UI/UX & Layout)	1. Build MarketSummaryCard Layout: Construct the overall layout of the card, including sections to display text-based data like VIX, Interest Rate, CPI, and Unemployment.<br>2. Integrate FE1 Components: Place the S&P500Sparkline and FearGreedGauge into the layout.<br>3. Data Integration (Mock): Fetch data from the backend's mock endpoint (/api/v1/market-summary) and manage the state, then pass props to child components.
BE1 (Financial Data)	1. Implement FinancialDataService: Implement the logic to fetch real data from the FRED API (CPI, Rate, Unemployment) and Google Finance API (VIX, S&P500).<br>2. Implement Scheduler: Create a MarketDataScheduler to periodically update the financial data.<br>3. Apply Caching Strategy: Apply a 24-hour Redis cache for economic indicator data.<br>4. Replace API Mock: Replace the mock data in the controller with actual service calls.
BE2 (News & AI)	1. Implement AiContentService: Implement logic to get the real-time Fear & Greed Index using the Claude Search API and generate the aiOutlook text for the interest rate using the Claude API.<br>2. Integrate Service: Integrate the generated AI content into the main MarketSummary data.<br>3. Apply Caching Strategy: Apply a 12-hour Redis cache for AI-generated content.<br>4. Replace API Mock: Replace the relevant mock data in the controller with actual service calls.

Export to Sheets
Phase 2: Build the Stock Card Foundation (Reusable Component)
Goal: To create the generic, reusable StockCard component that will be used for all 10 stocks.

Role	Tasks
FE1 (Graphs & Visualization)	1. Develop StockPriceChart Component: Create a responsive line chart using Recharts to display historical price data.<br>2. Develop PriceIndicator Component: Create a component to display the stock price, change, and percentage change with up/down coloring.<br>3. Develop RsiIndicator Component: Create a simple bar component to visually represent overbought/oversold status.<br>4. Develop AI Evaluation Visuals: Create rating badges and confidence indicators for the AI evaluation section.
FE2 (UI/UX & Layout)	1. Build StockCard Layout: Build the structure of a reusable card component that accepts a StockCardData object as its prop.<br>2. Implement Data Display Elements: Create the UI to display text-based data like stock name, symbol, market cap, P/E ratio, etc.<br>3. Integrate FE1 Components: Integrate the StockPriceChart, PriceIndicator, and RsiIndicator into the card.<br>4. Create AIEvaluationCard Component: Build a component to display the AI comprehensive evaluation (rating, confidence, key factors).<br>5. Implement Right-side AI Chatbot Interface: Create a collapsible/expandable right sidebar for the web and a modal/bottom-sheet for mobile.<br>6. Apply Skeleton UI: Create a SkeletonStockCard component to indicate loading states, including placeholders for the chart and AI evaluation areas.
BE1 (Financial Data)	1. Implement StocksService Stub: Create the service class with a getStockBySymbol method.<br>2. Create API Endpoint: Create a controller to handle requests at /api/v1/stocks/:symbol.<br>3. Return Mock Data: Implement the endpoint to return mock data from packages/mock/stocks.json to unblock frontend development.
BE2 (News & AI)	1. Validate Mock Data: Verify that AI evaluation, news, and RSI data in packages/mock/stocks.json match the expected real API response structure.

Export to Sheets
Phase 3: Parallel Feature Integration (All Stock Cards)
Goal: To leverage the foundation from Phase 2 to rapidly build and display all 10 stock card features in parallel.

Role	Tasks
FE1 (Graphs & Visualization)	1. Optimize Chart Performance: Optimize the 10 charts using React.memo and other techniques to ensure smooth rendering.<br>2. Integration Support: Assist FE2 with any visualization-related issues.
FE2 (UI/UX & Layout)	1. Implement List on HomeScreen: Use a map function to render 10 StockCard components with integrated AI evaluations.<br>2. Individual Data Fetching: Implement logic so that each StockCard asynchronously fetches its own data from /api/v1/stocks/:symbol when it mounts.<br>3. State Management: Implement loading (skeleton UI) and error states independently for each card.<br>4. AI Chatbot Integration: Implement chatbot state management and integrate it for context-aware questions related to individual stocks.
BE1 (Financial Data)	1. Integrate Real API: Replace mock logic with calls to the Google Finance API for real price, fundamental, and historical chart data.<br>2. Apply 5-Min Caching: Apply a 5-minute Redis cache to real-time stock data.<br>3. Monitor Performance: Prepare for multiple simultaneous API calls from the frontend.
BE2 (News & AI)	1. Integrate Real AI Services: Augment data from BE1 with AI evaluation (Claude API), news summaries (Google News + Claude API), and calculated RSI.<br>2. Combine Data: Complete the getStockBySymbol logic to combine data from BE1 and BE2 into a single StockCardData object.<br>3. Review Caching Strategy: Set appropriate cache TTLs (12 hours for AI evaluations, 6 hours for news, 1 hour for chat).

Export to Sheets
Phase 4: Authentication & Personalization
Goal: To implement user login and allow logged-in users to view their own custom watchlist.

New Feature Requirements
1. User Authentication System
Login Methods: Social login via Google, Facebook, GitHub.

Auth Management: JWT token-based session management.

User Profile: Basic user information and settings.

2. Watchlist Management System
Default Stocks: Non-logged-in users see the default 10 stocks (AAPL, TSLA, etc.).

Custom Watchlist: Logged-in users can manage a personal watchlist.

Management Functions: Add, remove, and reorder stocks.

Max Stocks: 10 (expandable in the future).

UI Layout & Design
Desktop Layout (1024px+)
┌─────────────────────┬───────────────────┬─────────────────────┐
│                     │  Watchlist Widget   │                     │
│                     │  ┌───────────────┐   │                     │
│   Main Content Area   │  │ [+ Add Stock]  │   │   AI Chatbot        │
│   ┌─────────────┐   │  │ ○ AAPL       │   │   ┌─────────────┐   │
│   │Market Summary │   │  │ ○ TSLA       │   │   │ Chat Header   │   │
│   └─────────────┘   │  │ ○ MSFT   [x] │   │   ├─────────────┤   │
│   ┌─────────────┐   │  └───────────────┘   │   │  Message      │   │
│   │Stock Card 1   │   │                     │   │  Area         │   │
│   │ - Chart       │   │                     │   ├─────────────┤   │
│   │ - AI Eval     │   │                     │   │ Input Box     │   │
│   │ - News        │   │                     │   └─────────────┘   │
│   └─────────────┘   │                     │                     │
└─────────────────────┴───────────────────┴─────────────────────┘
Mobile Layout:
Watchlist: Located in a header dropdown or drawer menu.

AI Chatbot: Accessed via a floating action button that opens a modal/bottom sheet.

Stock List: A vertical list of scrollable cards.

Implementation Tasks (Phase 4)
Role	Tasks
FE Team (FE1 & FE2)	1. Develop Auth UI: Implement Login and Settings screens (FE2 leads, FE1 supports).<br>2. Implement Watchlist Widget: Create a collapsible watchlist panel in the top-right area.<br>3. Implement Stock Management UI: Build the interface to add, remove, and reorder stocks.<br>4. Conditional Rendering: Display the default list vs. the custom watchlist based on login state.<br>5. Real-time Sync: Automatically update the main screen when the watchlist changes.
BE Team (BE1 & BE2)	1. Database Schema: Design users and watchlists tables in PostgreSQL.<br>2. Authentication System: Implement Firebase Auth and JWT token system.<br>3. Watchlist API: Implement CRUD endpoints for watchlist management.<br>4. Security & Permissions: Implement JWT validation guards to protect user-specific data.

Export to Sheets
New API Endpoints (Phase 4)
Bash

# Authentication System
POST /api/v1/auth/login      # Social login
POST /api/v1/auth/logout     # Logout
GET  /api/v1/auth/profile    # User profile

# Watchlist Management
GET    /api/v1/user/watchlist     # Get user's watchlist
POST   /api/v1/user/watchlist     # Add stock to watchlist
DELETE /api/v1/user/watchlist/:symbol  # Remove stock from watchlist
PUT    /api/v1/user/watchlist/order    # Reorder watchlist
Dependencies and Integration Considerations
State Management: Use global state (e.g., Zustand) for user auth and watchlist data.

Caching Strategy: Cache user-specific watchlist data (e.g., 1-hour TTL).

Real-time Updates: Re-fetch main data when the watchlist is modified.

UI Responsiveness: Ensure proper spacing and layout for the watchlist widget and AI chatbot.