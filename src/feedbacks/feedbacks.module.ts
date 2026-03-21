import { Module } from '@nestjs/common';
import { FeedbacksController } from './feedbacks.controller';
import { FeedbacksService } from './feedbacks.service';
import { FeedbackRateLimitGuard } from './feedbacks.guard';

@Module({
  controllers: [FeedbacksController],
  providers: [FeedbacksService, FeedbackRateLimitGuard],
})
export class FeedbacksModule {}
