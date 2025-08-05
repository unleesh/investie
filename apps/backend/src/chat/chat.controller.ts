import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { ChatMessage, ChatSession } from '@investie/types';

@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  async createSession(): Promise<ChatSession> {
    return this.chatService.createSession();
  }

  @Post('sessions/:id/messages')
  async sendMessage(
    @Param('id') sessionId: string,
    @Body('message') message: string,
  ): Promise<ChatMessage> {
    return this.chatService.sendMessage(sessionId, message);
  }

  @Get('sessions/:id')
  async getSession(
    @Param('id') sessionId: string,
  ): Promise<ChatSession | null> {
    return this.chatService.getSession(sessionId);
  }

  @Get('sessions')
  async getRecentSessions(): Promise<ChatSession[]> {
    return this.chatService.getRecentSessions();
  }

  @Delete('sessions/:id')
  async endSession(
    @Param('id') sessionId: string,
  ): Promise<{ success: boolean }> {
    return this.chatService.endSession(sessionId);
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
