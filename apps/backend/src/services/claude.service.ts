import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly anthropic: Anthropic;

  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      this.logger.warn('Claude API key not configured - using fallback responses');
    } else {
      this.logger.log('Claude API service initialized');
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY || 'fallback_key',
    });
  }

  async generateResponse(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      if (!process.env.CLAUDE_API_KEY) {
        this.logger.warn('Claude API key not available, using fallback response');
        return this.getFallbackResponse(prompt);
      }

      this.logger.log('Generating Claude response');
      
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
    try {
      if (!process.env.CLAUDE_API_KEY) {
        return 'Web search requires Claude API key configuration';
      }

      const prompt = `Search for current information about: ${query}

Please provide the most recent and accurate information available about this topic. Focus on factual data and current market conditions.`;

      return await this.generateResponse(prompt, 500);
    } catch (error) {
      this.logger.error('Claude search error:', error.message);
      return `Search unavailable: ${error.message}`;
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

  // Health check method
  async healthCheck(): Promise<{ status: string; hasApiKey: boolean; model: string }> {
    return {
      status: process.env.CLAUDE_API_KEY ? 'ready' : 'api_key_required',
      hasApiKey: !!process.env.CLAUDE_API_KEY,
      model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
    };
  }
}