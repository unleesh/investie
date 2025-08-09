# ⚡ Investie Quick Start

5-minute setup guide to get Investie running locally.

## 🚀 Fast Track Setup

### 1. Install & Setup (2 minutes)
```bash
# Clone and install
git clone <repo-url> && cd investie
npm install

# Create backend environment file
echo 'CLAUDE_API_KEY=your-key-here
SERPAPI_API_KEY=your-key-here  
FRED_API_KEY=your-key-here
PORT=3002' > apps/backend/.env

# Create frontend environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:3002' > apps/web/.env.local
```

### 2. Get API Keys (2 minutes)
- **Claude**: https://console.anthropic.com/ → API Keys
- **SerpApi**: https://serpapi.com/ → Dashboard → API Key  
- **FRED**: https://fred.stlouisfed.org/docs/api/api_key.html

### 3. Start Everything (1 minute)
```bash
npm run dev
```

## 🎯 Quick Verification

Open these URLs to verify setup:

| URL | Expected Result |
|-----|-----------------|
| http://localhost:3002/api/v1/health | `{"status":"ok"}` |
| http://localhost:3001/live | ✅ Complete Demo Page |
| http://localhost:3002/api/v1/market-summary | Real market data |

## 🔧 One-Line Commands

```bash
# Test backend
curl http://localhost:3002/api/v1/health

# Test with real data  
curl http://localhost:3002/api/v1/stocks/AAPL | jq '.aiEvaluation.rating'

# Build everything
npm run build

# Clean restart
npm run clean && npm install && npm run dev
```

## 💡 Without API Keys?

The app works perfectly with comprehensive mock data:
```bash
# Skip API key setup, just run:
npm install && npm run dev
```

**✅ You're ready! Visit http://localhost:3001/live**

---
📚 **Need detailed setup?** See [LOCAL_SETUP.md](./LOCAL_SETUP.md)