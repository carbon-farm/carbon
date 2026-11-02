import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';

@Module({
  providers: [ReleasesService],
})
export class ReleasesModule {}
