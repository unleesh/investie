import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        API_VERSION: Joi.string().default('v1'),
        
        FRED_API_KEY: Joi.string().required(),
        SERPAPI_API_KEY: Joi.string().required(),
        CLAUDE_API_KEY: Joi.string().optional(),
        
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional(),
        
        ECONOMIC_DATA_TTL: Joi.number().default(86400),
        STOCK_DATA_TTL: Joi.number().default(300),
        AI_CONTENT_TTL: Joi.number().default(43200),
        NEWS_DATA_TTL: Joi.number().default(21600),
        CHAT_SESSION_TTL: Joi.number().default(3600),
      }),
    }),
  ],
})
export class ConfigModule {}