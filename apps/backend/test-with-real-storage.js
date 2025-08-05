// Test using the actual NewsService with JSON storage
require('dotenv').config();
const axios = require('axios');
const OpenAI = require('openai').default;
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class RealNewsServiceTest {
  constructor() {
    this.serpApiKey = process.env.SERPAPI_API_KEY;
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openai = this.openaiApiKey ? new OpenAI({ apiKey: this.openaiApiKey }) : null;
    this.baseUrl = 'https://serpapi.com/search';
    this.dataDir = path.join(__dirname, 'data', 'news');
  }

  getCompanyName(symbol) {
    const companyMap = {
      AAPL: 'Apple',
      TSLA: 'Tesla',
      MSFT: 'Microsoft',
      GOOGL: 'Google Alphabet',
      AMZN: 'Amazon',
      NVDA: 'NVIDIA',
      META: 'Meta Facebook',
      NFLX: 'Netflix',
      AVGO: 'Broadcom',
      AMD: 'AMD',
      GOOG: 'Google',
      FB: 'Facebook',
      INTC: 'Intel',
      CRM: 'Salesforce',
      ORCL: 'Oracle',
      IBM: 'IBM',
      UBER: 'Uber',
      LYFT: 'Lyft',
      SNAP: 'Snapchat',
      COIN: 'Coinbase',
      PLTR: 'Palantir'
    };
    return companyMap[symbol.toUpperCase()] || symbol.toUpperCase();
  }

  // This mirrors the actual NewsService.getStockNews method
  async getStockNews(symbol) {
    console.log(`\n🔍 Fetching news for ${symbol.toUpperCase()} (with storage)...`);
    console.log('='.repeat(60));

    if (!this.serpApiKey || this.serpApiKey === 'your-serpapi-key-here') {
      console.log('⚠️  SERPAPI_KEY not configured - would return null');
      return null;
    }

    try {
      const companyName = this.getCompanyName(symbol);
      console.log(`📡 Searching: "${companyName} ${symbol.toUpperCase()} stock"`);
      
      const response = await axios.get(this.baseUrl, {
        params: {
          engine: 'google_news',
          q: `${companyName} ${symbol.toUpperCase()} stock`,
          gl: 'us',
          hl: 'en',
          api_key: this.serpApiKey,
        },
        timeout: 10000,
      });

      if (response.data.error) {
        console.log('❌ SerpAPI error:', response.data.error);
        return null;
      }

      const newsResults = response.data.news_results;
      if (!newsResults || newsResults.length === 0) {
        console.log('❌ No news found');
        return null;
      }

      console.log(`✅ Found ${newsResults.length} articles`);
      
      // Show first 3 headlines
      console.log('\n📰 Top Headlines:');
      newsResults.slice(0, 3).forEach((article, i) => {
        console.log(`   ${i+1}. ${article.title}`);
      });

      // Use first article for analysis
      const topNews = newsResults[0];
      const headline = topNews.title || `Latest news for ${symbol}`;

      // Analyze sentiment using the three-tier system
      console.log(`\n🎯 Analyzing: "${headline.substring(0, 80)}..."`);
      const sentiment = await this.analyzeSentimentWithAI(headline);

      const newsData = {
        headline,
        sentiment,
        source: 'google_news + claude_ai',
      };

      // **THIS IS THE KEY PART** - Store the data like the real NewsService
      console.log('\n💾 Storing news data to JSON...');
      await this.storeNewsData(symbol.toUpperCase(), newsData, newsResults);

      return newsData;

    } catch (error) {
      console.log('❌ Error fetching news:', error.message);
      return null;
    }
  }

  // Three-tier sentiment analysis (mirrors NewsService)
  async analyzeSentimentWithAI(headline) {
    console.log('🧠 AI Sentiment Analysis:');
    
    // Try Claude first
    const claudeResult = await this.tryClaudeSentiment(headline);
    if (claudeResult) {
      console.log('   ✅ Claude analyzed:', claudeResult);
      return claudeResult;
    }

    // Try OpenAI second
    const openaiResult = await this.tryOpenAISentiment(headline);
    if (openaiResult) {
      console.log('   ✅ OpenAI analyzed:', openaiResult);
      return openaiResult;
    }

    // Keyword fallback
    console.log('   🔤 Using keyword fallback');
    return this.fallbackSentiment(headline);
  }

  async tryClaudeSentiment(headline) {
    if (!this.claudeApiKey) return null;
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: `Sentiment of "${headline}": positive, negative, or neutral?` }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.claudeApiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 8000
        }
      );
      const sentiment = response.data.content[0]?.text?.trim().toLowerCase();
      return (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') ? sentiment : null;
    } catch (error) {
      return null;
    }
  }

  async tryOpenAISentiment(headline) {
    if (!this.openai) return null;
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Sentiment of "${headline}": positive, negative, or neutral?` }],
        max_tokens: 10,
        temperature: 0
      });
      const sentiment = response.choices[0]?.message?.content?.trim().toLowerCase();
      return (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') ? sentiment : null;
    } catch (error) {
      return null;
    }
  }

  fallbackSentiment(headline) {
    const positiveWords = ['up', 'rise', 'gain', 'growth', 'surge', 'strong', 'beat', 'profit'];
    const negativeWords = ['down', 'fall', 'drop', 'decline', 'loss', 'crash', 'weak', 'miss'];
    
    const lowerHeadline = headline.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerHeadline.includes(word));
    const hasNegative = negativeWords.some(word => lowerHeadline.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  // **STORAGE METHOD** - This is what creates the JSON files
  async storeNewsData(symbol, newsData, allArticles) {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        console.log('   📁 Created data/news/ directory');
      }

      const timestamp = new Date().toISOString();
      const filename = `${symbol}_${timestamp.split('T')[0]}_${Date.now()}.json`;
      const filepath = path.join(this.dataDir, filename);

      const storageData = {
        symbol,
        timestamp,
        query: `${this.getCompanyName(symbol)} ${symbol} stock`,
        summary: newsData,
        allArticles: allArticles.slice(0, 10), // Store top 10 articles
        metadata: {
          totalArticles: allArticles.length,
          source: 'serpapi_google_news',
          sentimentMethodsAvailable: {
            claude: this.claudeApiKey ? true : false,
            openai: this.openaiApiKey ? true : false,
            keyword: true
          },
          sentimentHierarchy: 'Claude → OpenAI → Keyword'
        }
      };

      // Write timestamped file
      fs.writeFileSync(filepath, JSON.stringify(storageData, null, 2));
      console.log(`   ✅ Stored: ${filename}`);

      // Write latest file for easy access
      const latestFile = path.join(this.dataDir, `${symbol}_latest.json`);
      fs.writeFileSync(latestFile, JSON.stringify(storageData, null, 2));
      console.log(`   ✅ Updated: ${symbol}_latest.json`);

      return { filename, filepath };
    } catch (error) {
      console.log(`   ❌ Storage failed:`, error.message);
      return null;
    }
  }

  // Method to show stored files
  showStoredFiles() {
    if (!fs.existsSync(this.dataDir)) {
      console.log('📂 No data directory found');
      return;
    }

    const files = fs.readdirSync(this.dataDir);
    if (files.length === 0) {
      console.log('📂 Data directory is empty');
      return;
    }

    console.log(`\n📂 Stored Files (${files.length}):`);
    files.forEach(file => {
      const stat = fs.statSync(path.join(this.dataDir, file));
      console.log(`   📄 ${file} (${stat.size} bytes)`);
    });
  }
}

async function runRealTest() {
  const tester = new RealNewsServiceTest();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🚀 Real NewsService Tester (with JSON Storage)');
  console.log('=' .repeat(60));
  console.log('This test uses the actual NewsService logic and stores JSON files');
  console.log('Enter stock symbols or commands:\n');
  console.log('Commands:');
  console.log('  • [SYMBOL] - Test news for stock symbol');
  console.log('  • "files" - Show stored JSON files');
  console.log('  • "quit" - Exit\n');

  const askForInput = () => {
    rl.question('📈 Enter command or stock symbol: ', async (input) => {
      const command = input.trim().toLowerCase();

      if (command === 'quit' || command === 'exit') {
        console.log('\n👋 Thanks for testing!');
        rl.close();
        return;
      }

      if (command === 'files') {
        tester.showStoredFiles();
        console.log('\n' + '─'.repeat(50));
        askForInput();
        return;
      }

      if (!input.trim()) {
        console.log('❌ Please enter a stock symbol or command\n');
        askForInput();
        return;
      }

      // Test the symbol
      const result = await tester.getStockNews(input.trim());
      
      if (result) {
        console.log('\n🎉 Final Result:');
        console.log('─'.repeat(40));
        console.log(`📊 Symbol: ${input.toUpperCase()}`);
        console.log(`📰 Headline: ${result.headline}`);
        console.log(`😊 Sentiment: ${result.sentiment}`);
        console.log(`🔗 Source: ${result.source}`);
        console.log('\n💾 JSON files have been created in data/news/');
      } else {
        console.log('\n❌ Failed to get news for', input.toUpperCase());
      }

      console.log('\n' + '─'.repeat(50));
      askForInput();
    });
  };

  askForInput();
}

runRealTest();