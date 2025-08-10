export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging',
}

// API client configuration
export const apiConfig = {
  baseURL: config.apiUrl,
  timeout: config.isProduction ? 10000 : 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}

// Validate required environment variables
if (config.isProduction && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required in production')
}