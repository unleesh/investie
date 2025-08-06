import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Basic endpoints', () => {
    it('/ (GET) should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('/api/v1/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });

  describe('API Key validation', () => {
    it('should have required environment variables for BE2', () => {
      expect(process.env.CLAUDE_API_KEY).toBeDefined();
      expect(process.env.SERPAPI_API_KEY).toBeDefined();
      expect(process.env.FRED_API_KEY).toBeDefined();
    });

    it('/api/v1/market-summary (GET) should use API keys', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/market-summary')
        .expect(200);
      
      // Should return market data (either real or mock)
      expect(response.body).toHaveProperty('fearGreedIndex');
      expect(response.body).toHaveProperty('vix');
      expect(response.body).toHaveProperty('interestRate');
    });

    it('/api/v1/stocks/AAPL (GET) should use API keys for stock data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/stocks/AAPL')
        .expect(200);
      
      // Should return stock data with BE2 AI evaluation
      expect(response.body).toHaveProperty('symbol', 'AAPL');
      expect(response.body).toHaveProperty('aiEvaluation');
      expect(response.body.aiEvaluation).toHaveProperty('rating');
      expect(response.body.aiEvaluation).toHaveProperty('confidence');
    });

    it('/api/v1/chat/sessions (POST) should use Claude API key', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/chat/sessions')
        .expect(201);
      
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('isActive', true);
    });
  });
});
