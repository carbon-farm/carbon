import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { CasesSchedulerService } from './cases.scheduler';
import { ExpertsModule } from '../experts/experts.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [ExpertsModule, UploadsModule],
  controllers: [CasesController],
  providers: [CasesService, CasesSchedulerService],
  exports: [CasesService],
})
export class CasesModule {}
