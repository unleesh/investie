// Direct test of the storage functionality
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function testDirectStorage() {
  console.log('🧪 Direct Storage Test...\n');
  
  const dataDir = path.join(__dirname, 'data', 'news');
  console.log('📁 Data directory:', dataDir);
  
  // Check if directory exists
  if (fs.existsSync(dataDir)) {
    console.log('✅ Data directory exists');
    const files = fs.readdirSync(dataDir);
    console.log(`📄 Current files: ${files.length}`);
    files.forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('❌ Data directory does not exist');
    console.log('🔧 Creating directory...');
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Directory created');
  }

  // Test writing a GOOGL file directly
  console.log('\n📝 Testing GOOGL file creation...');
  
  const testData = {
    symbol: 'GOOGL',
    timestamp: new Date().toISOString(),
    query: 'Google Alphabet GOOGL stock',
    summary: {
      headline: 'Test GOOGL Headline',
      sentiment: 'positive',
      source: 'google_news + claude_ai'
    },
    allArticles: [
      { title: 'Test Article 1', source: 'Test Source', date: '2025-08-05' },
      { title: 'Test Article 2', source: 'Test Source', date: '2025-08-05' }
    ],
    metadata: {
      totalArticles: 2,
      source: 'test_direct',
      sentimentMethodsAvailable: {
        claude: true,
        openai: true,
        keyword: true
      }
    }
  };

  const timestamp = new Date().toISOString();
  const filename = `GOOGL_${timestamp.split('T')[0]}_${Date.now()}.json`;
  const filepath = path.join(dataDir, filename);
  const latestFile = path.join(dataDir, 'GOOGL_latest.json');

  try {
    // Write timestamped file
    fs.writeFileSync(filepath, JSON.stringify(testData, null, 2));
    console.log('✅ Created:', filename);
    
    // Write latest file
    fs.writeFileSync(latestFile, JSON.stringify(testData, null, 2));
    console.log('✅ Created: GOOGL_latest.json');
    
    // Verify files exist
    console.log('\n🔍 Verification:');
    const filesAfter = fs.readdirSync(dataDir);
    console.log(`📄 Total files now: ${filesAfter.length}`);
    
    const googlFiles = filesAfter.filter(f => f.includes('GOOGL'));
    console.log(`📊 GOOGL files: ${googlFiles.length}`);
    googlFiles.forEach(file => {
      const stat = fs.statSync(path.join(dataDir, file));
      console.log(`   ✅ ${file} (${stat.size} bytes)`);
    });
    
    // Show file content preview
    console.log('\n📄 GOOGL_latest.json preview:');
    const content = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    console.log(`   Symbol: ${content.symbol}`);
    console.log(`   Headline: ${content.summary.headline}`);
    console.log(`   Sentiment: ${content.summary.sentiment}`);
    console.log(`   Articles: ${content.metadata.totalArticles}`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDirectStorage();