import { Module } from '@nestjs/common';
import { HariharaaService } from './hariharaa.service';
import { HariharaaController } from './hariharaa.controller';
import { HariharaaPublicController } from './hariharaa-public.controller';

@Module({
  controllers: [HariharaaController, HariharaaPublicController],
  providers: [HariharaaService],
  exports: [HariharaaService],
})
export class HariharaaModule {}
