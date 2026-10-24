import { Module } from '@nestjs/common';
import { SeasonalController } from './seasonal.controller';
import { SeasonalService } from './seasonal.service';
import { HariharaaModule } from '../hariharaa/hariharaa.module';

// HariharaaModule supplies the membership check used by MembershipGuard.
@Module({
  imports: [HariharaaModule],
  controllers: [SeasonalController],
  providers: [SeasonalService],
})
export class SeasonalModule {}
