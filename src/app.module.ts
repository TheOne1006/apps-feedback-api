import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CoreModule, FeedbacksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
