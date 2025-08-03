import { ChatService } from './chat.service';
import type { ChatMessage, ChatSession } from '@investie/types';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createSession(): Promise<ChatSession>;
    sendMessage(sessionId: string, message: string): Promise<ChatMessage>;
    getSession(sessionId: string): Promise<ChatSession | null>;
    getRecentSessions(): Promise<ChatSession[]>;
    endSession(sessionId: string): Promise<{
        success: boolean;
    }>;
    getHealth(): {
        status: string;
        timestamp: string;
    };
}
