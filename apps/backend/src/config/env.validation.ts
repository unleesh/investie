import { IsString, IsUrl, IsEnum, IsOptional, IsPort } from 'class-validator'

export class EnvironmentVariables {
  @IsEnum(['development', 'staging', 'production'])
  NODE_ENV: string

  @IsPort()
  @IsOptional()
  PORT?: string

  @IsString()
  SERPAPI_API_KEY: string

  @IsString()
  CLAUDE_API_KEY: string

  @IsString()
  FRED_API_KEY: string

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string

  @IsOptional()
  @IsString()
  DATABASE_URL?: string

  @IsOptional()
  @IsString()
  REDIS_URL?: string

  @IsOptional()
  @IsString()
  LOG_LEVEL?: string
}