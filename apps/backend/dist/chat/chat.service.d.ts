import type { ChatMessage, ChatSession } from '@investie/types';
export declare class ChatService {
    private sessions;
    createSession(): Promise<ChatSession>;
    sendMessage(sessionId: string, message: string): Promise<ChatMessage>;
    getSession(sessionId: string): Promise<ChatSession | null>;
    getRecentSessions(): Promise<ChatSession[]>;
    endSession(sessionId: string): Promise<{
        success: boolean;
    }>;
}
