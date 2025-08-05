"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIEvaluationService = void 0;
const common_1 = require("@nestjs/common");
let AIEvaluationService = class AIEvaluationService {
    async generateEvaluation(symbol) {
        const mockEvaluation = {
            summary: `AI evaluation for ${symbol} will be generated using Claude API in Phase 1.`,
            rating: 'neutral',
            confidence: 75,
            keyFactors: [
                'Market conditions',
                'Financial metrics',
                'Industry trends',
                'Technical indicators',
            ],
            timeframe: '3M',
            source: 'claude_ai',
            lastUpdated: new Date().toISOString(),
        };
        return mockEvaluation;
    }
};
exports.AIEvaluationService = AIEvaluationService;
exports.AIEvaluationService = AIEvaluationService = __decorate([
    (0, common_1.Injectable)()
], AIEvaluationService);
//# sourceMappingURL=ai-evaluation.service.js.map