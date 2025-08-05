// Test NewsService with custom stock symbol input
require('dotenv').config();
const axios = require('axios');
const OpenAI = require('openai').default;
const readline = require('readline');

class CustomNewsServiceTest {
  constructor() {
    this.serpApiKey = process.env.SERPAPI_API_KEY;
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openai = this.openaiApiKey ? new OpenAI({ apiKey: this.openaiApiKey }) : null;
    this.baseUrl = 'https://serpapi.com/search';
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
      // Add more as needed
      GOOG: 'Google',
      FB: 'Facebook',
      INTC: 'Intel',
      CRM: 'Salesforce',
      ORCL: 'Oracle',
      IBM: 'IBM',
      UBER: 'Uber',
      LYFT: 'Lyft',
      SNAP: 'Snapchat',
      TWTR: 'Twitter',
      COIN: 'Coinbase',
      PLTR: 'Palantir',
      RBLX: 'Roblox',
      SQ: 'Square',
      PYPL: 'PayPal'
    };
    return companyMap[symbol.toUpperCase()] || symbol.toUpperCase();
  }

  async getStockNews(symbol) {
    console.log(`\n🔍 Fetching news for ${symbol.toUpperCase()}...`);
    console.log('='.repeat(50));

    if (!this.serpApiKey || this.serpApiKey === 'your-serpapi-key-here') {
      console.log('⚠️  SERPAPI_KEY not configured - returning mock result');
      return {
        headline: `Mock news for ${symbol}: Stock shows mixed signals`,
        sentiment: 'neutral',
        source: 'mock_data'
      };
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
      
      // Show first 5 headlines
      console.log('\n📰 Recent Headlines:');
      newsResults.slice(0, 5).forEach((article, i) => {
        console.log(`   ${i+1}. ${article.title}`);
        console.log(`      📍 ${article.source} | ${article.date || 'Recent'}`);
      });

      // Use first article for sentiment analysis
      const topNews = newsResults[0];
      const headline = topNews.title || `Latest news for ${symbol}`;

      console.log(`\n🎯 Analyzing sentiment for: "${headline}"`);
      const sentiment = await this.analyzeSentiment(headline);

      const result = {
        headline,
        sentiment,
        source: 'google_news + ai_sentiment',
        totalArticles: newsResults.length,
        companyName
      };

      return result;

    } catch (error) {
      console.log('❌ Error fetching news:', error.message);
      return null;
    }
  }

  async analyzeSentiment(headline) {
    console.log('\n🧠 AI Sentiment Analysis:');
    
    // Try Claude first
    const claudeResult = await this.tryClaude(headline);
    if (claudeResult) {
      console.log('   ✅ Claude analyzed:', claudeResult);
      return claudeResult;
    }

    // Try OpenAI second
    const openaiResult = await this.tryOpenAI(headline);
    if (openaiResult) {
      console.log('   ✅ OpenAI analyzed:', openaiResult);
      return openaiResult;
    }

    // Keyword fallback
    const keywordResult = this.keywordSentiment(headline);
    console.log('   ✅ Keyword analyzed:', keywordResult);
    return keywordResult;
  }

  async tryClaude(headline) {
    if (!this.claudeApiKey) {
      console.log('   ⚠️  Claude API key not available');
      return null;
    }

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
      console.log('   ❌ Claude failed');
      return null;
    }
  }

  async tryOpenAI(headline) {
    if (!this.openai) {
      console.log('   ⚠️  OpenAI API key not available');
      return null;
    }

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
      console.log('   ❌ OpenAI failed');
      return null;
    }
  }

  keywordSentiment(headline) {
    const positiveWords = ['up', 'rise', 'gain', 'growth', 'surge', 'strong', 'beat', 'profit', 'jump', 'soar'];
    const negativeWords = ['down', 'fall', 'drop', 'decline', 'loss', 'crash', 'weak', 'miss', 'plummet', 'slide'];
    
    const lowerHeadline = headline.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerHeadline.includes(word));
    const hasNegative = negativeWords.some(word => lowerHeadline.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }
}

async function runCustomTest() {
  const tester = new CustomNewsServiceTest();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🚀 Custom NewsService Tester');
  console.log('=' .repeat(50));
  console.log('Enter stock symbols to test (or "quit" to exit)');
  console.log('Examples: AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META, etc.\n');

  const askForSymbol = () => {
    rl.question('📈 Enter stock symbol: ', async (symbol) => {
      if (symbol.toLowerCase() === 'quit' || symbol.toLowerCase() === 'exit') {
        console.log('\n👋 Thanks for testing!');
        rl.close();
        return;
      }

      if (!symbol.trim()) {
        console.log('❌ Please enter a valid stock symbol\n');
        askForSymbol();
        return;
      }

      const result = await tester.getStockNews(symbol.trim());
      
      if (result) {
        console.log('\n🎉 Final Result:');
        console.log('─'.repeat(30));
        console.log(`📊 Symbol: ${symbol.toUpperCase()}`);
        console.log(`🏢 Company: ${result.companyName || 'Unknown'}`);
        console.log(`📰 Headline: ${result.headline}`);
        console.log(`😊 Sentiment: ${result.sentiment}`);
        console.log(`📈 Total Articles: ${result.totalArticles || 'N/A'}`);
        console.log(`🔗 Source: ${result.source}`);
      } else {
        console.log('\n❌ Failed to get news for', symbol.toUpperCase());
      }

      console.log('\n' + '─'.repeat(50));
      askForSymbol();
    });
  };

  askForSymbol();
}

runCustomTest();