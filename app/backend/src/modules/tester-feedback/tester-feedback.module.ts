import { Module } from '@nestjs/common';
import { TesterFeedbackController } from './tester-feedback.controller';
import { TesterFeedbackService } from './tester-feedback.service';

@Module({
  controllers: [TesterFeedbackController],
  providers: [TesterFeedbackService],
})
export class TesterFeedbackModule {}
