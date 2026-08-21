import { Module } from '@nestjs/common';
import { SoilLabService } from './soil-lab.service';
import { SoilLabController } from './soil-lab.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  controllers: [SoilLabController],
  providers: [SoilLabService],
})
export class SoilLabModule {}
