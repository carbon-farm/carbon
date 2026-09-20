import { Global, Module } from '@nestjs/common';
import { HariharaaService } from './hariharaa.service';
import { MembershipPlansService } from './membership-plans.service';
import { MembershipRemindersService } from './membership-reminders.service';
import { HariharaaController } from './hariharaa.controller';
import { HariharaaPublicController } from './hariharaa-public.controller';

// Global so MembershipGuard (used by the farm-advice controllers) can inject HariharaaService.
@Global()
@Module({
  controllers: [HariharaaController, HariharaaPublicController],
  providers: [HariharaaService, MembershipPlansService, MembershipRemindersService],
  exports: [HariharaaService, MembershipPlansService],
})
export class HariharaaModule {}
