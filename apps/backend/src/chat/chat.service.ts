import { Injectable, Logger } from '@nestjs/common';
import type { ChatMessage, ChatSession, StockSymbol } from '@investie/types';
import { ClaudeService } from '../services/claude.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private sessions: Map<string, ChatSession> = new Map();

  constructor(
    private readonly claudeService: ClaudeService,
    private readonly cacheService: CacheService,
  ) {}

  async createSession(): Promise<ChatSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      sessionId,
      messages: [],
      isActive: true,
      lastActivity: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`Created chat session: ${sessionId}`);
    return session;
  }

  async sendMessage(
    sessionId: string, 
    message: string, 
    context?: 'market' | 'stock' | 'general', 
    relatedSymbol?: StockSymbol
  ): Promise<ChatMessage> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        context,
        relatedSymbol,
      };

      // Generate AI response
      const aiResponseContent = await this.generateAIResponse(message, session, context, relatedSymbol);
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date().toISOString(),
        context,
        relatedSymbol,
      };

      // Update session
      session.messages.push(userMessage, aiMessage);
      session.lastActivity = new Date().toISOString();
      
      // Cache recent messages context
      this.cacheService.set(`chat:${sessionId}:context`, session.messages.slice(-6), 60 * 60 * 1000); // 1 hour
      
      this.logger.log(`Generated AI response for session ${sessionId}`);
      return aiMessage;
    } catch (error) {
      this.logger.error(`Chat error for session ${sessionId}:`, error.message);
      
      // Fallback response
      return this.createFallbackResponse(message, context, relatedSymbol);
    }
  }

  private async generateAIResponse(
    message: string, 
    session: ChatSession, 
    context?: string, 
    relatedSymbol?: StockSymbol
  ): Promise<string> {
    const conversationHistory = session.messages.slice(-6).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const systemPrompt = this.buildSystemPrompt(context, relatedSymbol);
    const contextualPrompt = this.buildContextualPrompt(message, conversationHistory, context, relatedSymbol);

    const fullPrompt = `${systemPrompt}\n\n${contextualPrompt}`;

    return await this.claudeService.generateResponse(fullPrompt, 600);
  }

  private buildSystemPrompt(context?: string, relatedSymbol?: StockSymbol): string {
    return `You are Investie, an AI investment assistant designed to help retail investors make informed decisions.

Your core capabilities:
- Provide educational investment guidance and market insights
- Analyze stocks, market trends, and economic indicators
- Explain complex financial concepts in simple terms
- Help users understand risk and portfolio diversification
- Answer questions about specific stocks, ETFs, and market conditions

Important guidelines:
- Always emphasize that you provide educational information, not personalized financial advice
- Recommend users consult with licensed financial advisors for personalized guidance
- Warn about investment risks and the importance of diversification
- Never guarantee returns or make specific buy/sell recommendations
- Be conversational, helpful, and encouraging about learning
- Keep responses concise (2-3 paragraphs maximum)
- Use current market context when relevant

Context: ${context || 'general investment discussion'}
${relatedSymbol ? `Focus stock: ${relatedSymbol}` : ''}`;
  }

  private buildContextualPrompt(
    message: string, 
    conversationHistory: string, 
    context?: string, 
    relatedSymbol?: StockSymbol
  ): string {
    let prompt = '';

    if (conversationHistory.trim()) {
      prompt += `Previous conversation:\n${conversationHistory}\n\n`;
    }

    prompt += `User question: ${message}\n\n`;

    if (context === 'stock' && relatedSymbol) {
      prompt += `The user is asking about ${relatedSymbol}. Provide insights about this specific stock including recent performance, business fundamentals, and key factors to consider.\n\n`;
    } else if (context === 'market') {
      prompt += `The user is asking about general market conditions. Discuss current market trends, economic factors, and their potential impact on investments.\n\n`;
    }

    prompt += `Respond as Investie, the helpful AI investment assistant:`;

    return prompt;
  }

  private createFallbackResponse(message: string, context?: string, relatedSymbol?: StockSymbol): ChatMessage {
    let fallbackContent = '';

    if (context === 'stock' && relatedSymbol) {
      fallbackContent = `Thanks for asking about ${relatedSymbol}! I'm working on integrating real-time AI analysis capabilities. Meanwhile, I recommend checking our detailed stock cards which provide comprehensive data including price charts, fundamentals, and technical indicators. What specific aspect of ${relatedSymbol} interests you most?`;
    } else if (context === 'market') {
      fallbackContent = `Great question about the market! While I'm enhancing my real-time analysis capabilities, I suggest exploring our market summary section which provides current data on major indices, economic indicators, and market sentiment. Is there a specific market trend or economic factor you'd like to understand better?`;
    } else {
      const fallbackResponses = [
        "I'm currently being enhanced with advanced AI capabilities to provide better investment insights. While that's in progress, I can help you navigate our comprehensive stock data and market analysis tools. What would you like to explore?",
        "Thanks for your investment question! I'm developing more intelligent responses to help you better. Meanwhile, our platform offers detailed stock analysis, market summaries, and economic indicators. What area interests you most?",
        "Your question about investing is important to me. I'm being upgraded with real-time AI analysis features. For now, I recommend checking our market data and stock evaluations. How can I help guide you to the right information?",
      ];
      fallbackContent = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      role: 'assistant',
      content: fallbackContent,
      timestamp: new Date().toISOString(),
      context: (context === 'market' || context === 'stock') ? context : 'general',
      relatedSymbol,
    };
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getRecentSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 10);
  }

  async endSession(sessionId: string): Promise<{ success: boolean }> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      // Clear cached context
      this.cacheService.delete(`chat:${sessionId}:context`);
      this.logger.log(`Ended chat session: ${sessionId}`);
      return { success: true };
    }
    return { success: false };
  }

  // Get chat health and statistics
  async getHealthStatus(): Promise<{
    status: string;
    activeSessions: number;
    totalSessions: number;
    averageMessagesPerSession: number;
  }> {
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.isActive).length;
    const totalSessions = this.sessions.size;
    const totalMessages = Array.from(this.sessions.values()).reduce((sum, session) => sum + session.messages.length, 0);
    const averageMessages = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

    return {
      status: 'operational',
      activeSessions,
      totalSessions,
      averageMessagesPerSession: averageMessages,
    };
  }

  // Method to clear old inactive sessions (cleanup)
  cleanupInactiveSessions(maxAgeHours: number = 24): number {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (!session.isActive && new Date(session.lastActivity).getTime() < cutoffTime) {
        this.sessions.delete(sessionId);
        this.cacheService.delete(`chat:${sessionId}:context`);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} inactive chat sessions`);
    }

    return cleaned;
  }
}
