import { Injectable } from '@nestjs/common';
import type { ChatMessage, ChatSession } from '@investie/types';

@Injectable()
export class ChatService {
  private sessions: Map<string, ChatSession> = new Map();

  async createSession(): Promise<ChatSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      sessionId,
      messages: [],
      isActive: true,
      lastActivity: new Date().toISOString()
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    // Initially, return mock response
    // Later integrate with Claude API for real AI responses
    const mockResponse: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: `This is a mock AI response to: "${message}". Real Claude API integration will be implemented in Phase 1.`,
      timestamp: new Date().toISOString(),
      context: 'general'
    };

    const session = this.sessions.get(sessionId);
    if (session) {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        context: 'general'
      };
      
      session.messages.push(userMessage, mockResponse);
      session.lastActivity = new Date().toISOString();
    }

    return mockResponse;
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
      return { success: true };
    }
    return { success: false };
  }
}