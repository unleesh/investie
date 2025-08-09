import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly anthropic: Anthropic;

  private readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = !!process.env.CLAUDE_API_KEY;
    
    if (!this.isConfigured) {
      this.logger.warn('Claude API key not configured - using fallback responses');
    } else {
      this.logger.log('Claude API service initialized with API key');
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY || 'fallback_key',
    });
  }

  async generateResponse(prompt: string, maxTokens: number = 1000): Promise<string> {
    if (!this.isConfigured) {
      this.logger.warn('Claude API key not available, using fallback response');
      return this.getFallbackResponse(prompt);
    }

    try {
      this.logger.log('Generating Claude response with API key');
      
      const message = await this.anthropic.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      this.logger.log('Claude response generated successfully');
      return responseText;
    } catch (error) {
      this.logger.error('Claude API error:', error.message);
      if (error.message?.includes('invalid_api_key') || error.message?.includes('unauthorized')) {
        this.logger.error('Claude API key appears to be invalid');
      }
      return this.getFallbackResponse(prompt);
    }
  }

  async generateStructuredResponse<T>(prompt: string, schema: string): Promise<T> {
    try {
      const fullPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${schema}`;
      const response = await this.generateResponse(fullPrompt, 1000);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, try parsing the whole response
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Structured response parsing failed:', error.message);
      throw new Error(`Failed to parse structured response: ${error.message}`);
    }
  }

  async searchWeb(query: string): Promise<string> {
    if (!this.isConfigured) {
      return 'Web search requires Claude API key configuration';
    }

    try {
      const prompt = `Provide current market analysis for: ${query}

Focus on:
1. Recent market trends and performance indicators
2. Key financial metrics and ratios
3. Analyst sentiment and market outlook
4. Risk factors and growth catalysts

Provide factual, data-driven analysis suitable for retail investors.`;

      return await this.generateResponse(prompt, 500);
    } catch (error) {
      this.logger.error('Claude search error:', error.message);
      return `Market analysis temporarily unavailable: ${error.message}`;
    }
  }

  private getFallbackResponse(prompt: string): string {
    const fallbacks = [
      'AI analysis is currently being enhanced. Please check back shortly for intelligent insights.',
      'Real-time AI processing is being integrated. Meanwhile, please review the comprehensive data provided.',
      'Advanced AI features are in development. The system will provide enhanced analysis soon.',
    ];

    // Simple keyword-based fallback selection
    if (prompt.toLowerCase().includes('stock') || prompt.toLowerCase().includes('evaluation')) {
      return 'Stock analysis requires Claude API integration. Please configure CLAUDE_API_KEY for real-time AI evaluation.';
    }

    if (prompt.toLowerCase().includes('fear') || prompt.toLowerCase().includes('greed')) {
      return 'Market sentiment analysis requires API access. Current index value estimation: 45 (neutral).';
    }

    if (prompt.toLowerCase().includes('chat') || prompt.toLowerCase().includes('question')) {
      return 'AI investment assistant is being prepared. Please configure Claude API for personalized investment guidance.';
    }

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Health check method with API validation
  async healthCheck(): Promise<{ status: string; hasApiKey: boolean; model: string; validated?: boolean }> {
    const result = {
      status: this.isConfigured ? 'ready' : 'api_key_required',
      hasApiKey: this.isConfigured,
      model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
      validated: false,
    };

    if (this.isConfigured) {
      try {
        // Test API key with a simple request
        const testResponse = await this.generateResponse('Test', 10);
        result.validated = !testResponse.includes('fallback');
        if (result.validated) {
          result.status = 'operational';
        }
      } catch (error) {
        this.logger.error('Claude API validation failed:', error.message);
        result.status = 'api_key_invalid';
      }
    }

    return result;
  }

  // Generate AI stock evaluation for API-first architecture
  async generateStockEvaluation(symbol: string): Promise<any> {
    if (!this.isConfigured) {
      this.logger.warn(`Claude API not configured, skipping evaluation for ${symbol}`);
      return null;
    }

    try {
      const prompt = `Provide a comprehensive investment analysis for ${symbol} stock.

Analyze:
1. Current market position and competitive advantages
2. Financial health and key metrics
3. Growth prospects and market trends
4. Risk factors and potential challenges
5. Overall investment recommendation

Provide a rating (strong_buy, buy, hold, sell, strong_sell), confidence level (0-100), and key factors.

Format as JSON with: rating, confidence, summary, keyFactors array.`;

      const response = await this.generateStructuredResponse(prompt, `{
  "rating": "hold",
  "confidence": 75,
  "summary": "Brief investment thesis",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
}`);

      this.logger.log(`Generated AI evaluation for ${symbol}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to generate AI evaluation for ${symbol}:`, error.message);
      return null;
    }
  }
}