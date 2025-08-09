# 🚀 Investie Local Setup Guide

Complete guide to run Investie locally with real API integration.

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version

## 🔧 Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd investie

# Install all dependencies
npm install
```

### 2. Environment Configuration

Create environment files with your API keys:

#### Backend Environment (`.env`)
Create `apps/backend/.env`:

```bash
# ===========================================
# REQUIRED API KEYS FOR FULL FUNCTIONALITY
# ===========================================

# Claude AI API Key (for AI evaluations and chat)
CLAUDE_API_KEY=your-claude-api-key-here

# SerpApi Key (for Google Finance data)
SERPAPI_API_KEY=your-serpapi-key-here

# FRED API Key (for economic indicators)
FRED_API_KEY=your-fred-api-key-here

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================

# Server Configuration
PORT=3002
NODE_ENV=development

# Redis Configuration (optional - uses memory if not provided)
REDIS_URL=redis://localhost:6379
```

#### Frontend Environment (`.env.local`)
Create `apps/web/.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 🔑 API Keys Setup Guide

### 1. Claude AI API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up/Login to your account
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key and add to `CLAUDE_API_KEY`

### 2. SerpApi Key (Google Finance)
1. Visit [SerpApi](https://serpapi.com/)
2. Sign up for free account
3. Go to **Dashboard** → **API Key**
4. Copy the key and add to `SERPAPI_API_KEY`

### 3. FRED API Key (Economic Data)
1. Visit [FRED API](https://fred.stlouisfed.org/docs/api/api_key.html)
2. Create free FRED account
3. Request API key
4. Copy the key and add to `FRED_API_KEY`

## 🚀 Running the Application

### Option 1: Run All Services (Recommended)

```bash
# Start everything at once
npm run dev
```

This starts:
- 📱 **Mobile App**: Expo development server
- 🌐 **Web App**: Next.js on http://localhost:3001
- 🔧 **Backend API**: NestJS on http://localhost:3002

### Option 2: Run Services Individually

```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Web Frontend  
npm run dev:web

# Terminal 3: Mobile App (optional)
npm run dev:mobile
```

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3001 | Main web application |
| **Live Demo** | http://localhost:3001/live | Full feature demo |
| **Backend API** | http://localhost:3002 | REST API endpoints |
| **API Health** | http://localhost:3002/api/v1/health | Backend health check |
| **Mobile App** | Expo DevTools | React Native app |

## 🔍 API Endpoints

### Market Data
```bash
# Market summary with AI insights
GET http://localhost:3002/api/v1/market-summary

# Health check
GET http://localhost:3002/api/v1/health
```

### Stock Data
```bash
# All 10 stocks with complete data
GET http://localhost:3002/api/v1/stocks

# Individual stock with AI evaluation
GET http://localhost:3002/api/v1/stocks/AAPL

# Historical chart data
GET http://localhost:3002/api/v1/stocks/AAPL/chart?period=1W
```

### AI Chat System
```bash
# Create new chat session
POST http://localhost:3002/api/v1/chat/sessions

# Send message to AI
POST http://localhost:3002/api/v1/chat/sessions/:id/messages

# Get session history
GET http://localhost:3002/api/v1/chat/sessions/:id
```

## 🧪 Testing API Integration

### Test Backend Health
```bash
curl http://localhost:3002/api/v1/health
```

### Test Market Data
```bash
curl http://localhost:3002/api/v1/market-summary | jq '.'
```

### Test Stock Data
```bash
curl http://localhost:3002/api/v1/stocks/AAPL | jq '.aiEvaluation'
```

### Test All Endpoints
```bash
# Run comprehensive API test
./test_endpoints.sh
```

## 📊 Available Stock Symbols

The system supports these 10 stocks:
- **AAPL** - Apple Inc.
- **TSLA** - Tesla, Inc.  
- **MSFT** - Microsoft Corporation
- **GOOGL** - Alphabet Inc.
- **AMZN** - Amazon.com Inc.
- **NVDA** - NVIDIA Corporation
- **META** - Meta Platforms Inc.
- **NFLX** - Netflix Inc.
- **AVGO** - Broadcom Inc.
- **AMD** - Advanced Micro Devices

## 🔧 Development Commands

### Build Commands
```bash
# Build all packages and apps
npm run build

# Build only shared packages
npm run build:packages

# Build only apps  
npm run build:apps
```

### Testing Commands
```bash
# Run all tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Maintenance Commands
```bash
# Clean all build files
npm run clean

# Reinstall all dependencies
npm run install:all
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# If port 3002 is busy, change backend port
PORT=3003 npm run dev:backend

# Update frontend API URL accordingly
NEXT_PUBLIC_API_URL=http://localhost:3003
```

#### 2. API Keys Not Working
```bash
# Verify environment file location
ls apps/backend/.env

# Check if keys are loaded
curl http://localhost:3002/api/v1/health
```

#### 3. Build Errors
```bash
# Clean and reinstall
npm run clean
npm run install:all
npm run build:packages
npm run build
```

#### 4. Missing Dependencies
```bash
# Install missing packages
npm install

# For specific workspace
npm install --workspace=web
npm install --workspace=backend
```

### Debug Mode

Enable detailed logging:

```bash
# Backend with debug logs
DEBUG=investie:* npm run dev:backend

# Check API responses
curl -v http://localhost:3002/api/v1/health
```

## 🔒 Production Considerations

### Security
- Never commit API keys to repository
- Use environment variables in production
- Implement rate limiting for public APIs
- Add proper CORS configuration

### Performance
- Enable Redis caching in production
- Set up CDN for static assets
- Implement API response compression
- Monitor API usage and costs

### Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 💡 Development Tips

### Hot Reloading
- Web app: Automatic hot reload on file changes
- Backend: Automatic restart with `--watch` flag
- Mobile: Expo hot reload in development

### Data Sources
- **Without API keys**: Uses comprehensive mock data
- **With API keys**: Real-time data from financial APIs
- **Fallback**: Graceful degradation to mock data if APIs fail

### Monitoring
- Check backend logs for API call success/failures
- Monitor API usage to avoid rate limits
- Use browser DevTools to debug frontend issues

## 📞 Support

### Getting Help
- Check logs in terminal for error messages
- Verify API keys are valid and have sufficient quota
- Ensure all required services are running
- Test individual API endpoints before full integration

### Common Success Indicators
- ✅ Backend health returns `{"status": "ok"}`
- ✅ Market summary returns real Fear & Greed data
- ✅ Stock endpoints return AI evaluations
- ✅ Web app loads at http://localhost:3001/live
- ✅ All charts and data display properly

---

## 🎉 You're Ready!

Once you see these success indicators, your Investie application is running with full API integration!

**Next Steps:**
1. Visit http://localhost:3001/live for the complete demo
2. Test different stock symbols and time periods
3. Interact with the AI chat system
4. Explore mobile app features via Expo

**Happy Coding! 🚀**