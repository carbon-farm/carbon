import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { ExpertsModule } from '../experts/experts.module';

// TODO(Stage 2, follow-up): CasesService.abandon() is manually triggered —
// there's no scheduler (BullMQ, per 16-Appendix/Timeline-Technology-Security.md)
// wired up yet to run it automatically once a case has been Waiting Farmer
// past its SLA window. Real, not hidden — see cases.service.ts's comment on
// abandon() and README.md.
@Module({
  imports: [ExpertsModule],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
