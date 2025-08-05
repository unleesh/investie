// Detailed NewsService testing script
const axios = require('axios');

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

async function testNewsForStock(symbol, companyName) {
  console.log(`\n🔍 Testing news for ${symbol} (${companyName})`);
  console.log('='.repeat(50));

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_news',
        q: `${companyName} ${symbol} stock`,
        gl: 'us',
        hl: 'en',
        api_key: SERPAPI_KEY,
      },
      timeout: 10000,
    });

    if (response.data.news_results && response.data.news_results.length > 0) {
      console.log(`✅ Found ${response.data.news_results.length} articles`);
      
      // Show first 3 articles
      response.data.news_results.slice(0, 3).forEach((article, index) => {
        console.log(`\n📰 Article ${index + 1}:`);
        console.log(`   Title: ${article.title}`);
        console.log(`   Source: ${article.source}`);
        console.log(`   Date: ${article.date || 'N/A'}`);
        if (article.snippet) {
          console.log(`   Snippet: ${article.snippet.substring(0, 100)}...`);
        }
        
        // Test sentiment analysis
        const sentiment = analyzeSentiment(article.title);
        console.log(`   Sentiment: ${sentiment}`);
      });
    } else {
      console.log('❌ No news results found');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

function analyzeSentiment(headline) {
  const positiveWords = ['up', 'rise', 'gain', 'growth', 'surge', 'beat', 'strong'];
  const negativeWords = ['down', 'fall', 'drop', 'decline', 'loss', 'crash', 'weak'];
  
  const lowerHeadline = headline.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerHeadline.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerHeadline.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive 📈';
  if (negativeCount > positiveCount) return 'negative 📉';
  return 'neutral ➡️';
}

async function main() {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'your-serpapi-key-here') {
    console.log('❌ Please set a real SERPAPI_API_KEY in your .env file');
    console.log('📝 Get one free at: https://serpapi.com');
    return;
  }

  console.log('🚀 Testing NewsService with Real API Data...');
  
  // Test a few different stocks
  await testNewsForStock('AAPL', 'Apple');
  await testNewsForStock('TSLA', 'Tesla');
  await testNewsForStock('NVDA', 'NVIDIA');
}

main();