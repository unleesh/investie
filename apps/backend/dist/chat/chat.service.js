"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
let ChatService = class ChatService {
    sessions = new Map();
    async createSession() {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const session = {
            sessionId,
            messages: [],
            isActive: true,
            lastActivity: new Date().toISOString(),
        };
        this.sessions.set(sessionId, session);
        return session;
    }
    async sendMessage(sessionId, message) {
        const mockResponse = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: `This is a mock AI response to: "${message}". Real Claude API integration will be implemented in Phase 1.`,
            timestamp: new Date().toISOString(),
            context: 'general',
        };
        const session = this.sessions.get(sessionId);
        if (session) {
            const userMessage = {
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
                context: 'general',
            };
            session.messages.push(userMessage, mockResponse);
            session.lastActivity = new Date().toISOString();
        }
        return mockResponse;
    }
    async getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    async getRecentSessions() {
        return Array.from(this.sessions.values())
            .sort((a, b) => new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime())
            .slice(0, 10);
    }
    async endSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            return { success: true };
        }
        return { success: false };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)()
], ChatService);
//# sourceMappingURL=chat.service.js.map