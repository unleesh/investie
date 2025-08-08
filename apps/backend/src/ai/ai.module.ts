import { Module } from '@nestjs/common';
import { AIEvaluationService } from './ai-evaluation.service';
import { ClaudeService } from '../services/claude.service';
import { TechnicalAnalysisService } from '../services/technical-analysis.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [
    AIEvaluationService,
    ClaudeService,
    TechnicalAnalysisService,
  ],
  exports: [
    AIEvaluationService,
    TechnicalAnalysisService,
  ],
})
export class AIModule {}