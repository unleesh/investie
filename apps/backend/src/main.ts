import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for development
  app.enableCors();
  
  const port = process.env.PORT ?? 3000;
  
  // Debug API key configuration on startup
  const debugMode = process.env.DEBUG_MODE === 'true';
  if (debugMode) {
    console.log('\n🔐 [STARTUP DEBUG] API Keys Configuration:');
    console.log('  CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? `${process.env.CLAUDE_API_KEY.slice(0, 10)}...` : '❌ NOT_SET');
    console.log('  SERPAPI_API_KEY:', process.env.SERPAPI_API_KEY ? `${process.env.SERPAPI_API_KEY.slice(0, 10)}...` : '❌ NOT_SET');
    console.log('  FRED_API_KEY:', process.env.FRED_API_KEY ? `${process.env.FRED_API_KEY.slice(0, 8)}...` : '❌ NOT_SET');
    console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.slice(0, 10)}...` : '⚠️  NOT_SET (optional)');
    
    if (!process.env.CLAUDE_API_KEY && !process.env.SERPAPI_API_KEY && !process.env.FRED_API_KEY) {
      console.log('\n⚠️  WARNING: No API keys configured. Server will run in fallback mode.');
      console.log('   To enable full functionality, set the required API keys in your .env file.');
    }
    console.log('');
  }
  
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
  console.log(`💬 Chat health: http://localhost:${port}/api/v1/chat/health`);
  
  if (debugMode) {
    console.log(`🔍 DEBUG MODE: Enhanced logging enabled`);
    console.log(`📈 Market summary: http://localhost:${port}/api/v1/market-summary`);
    console.log(`📊 Stock data: http://localhost:${port}/api/v1/stocks`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
