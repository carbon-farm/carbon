import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CasesService } from './cases.service';

// SLA window: how long a case may sit in Waiting Farmer before the sweep
// closes it as Abandoned. Not specified by the Charter as a fixed number —
// picked as a reasonable default and kept as one constant so it's easy to
// tune later without hunting through the sweep logic.
const WAITING_FARMER_SLA_HOURS = 72;

// Fills the gap CasesService.abandon()'s own comment used to flag: nothing
// was closing Waiting Farmer cases automatically, so a farmer who never
// responded left the case (and the assigned expert) stuck indefinitely.
//
// Caveat that's real and worth knowing, not hidden: Render's free tier
// spins the backend down after ~15 minutes of inactivity, and a sleeping
// process doesn't run cron jobs. This sweep only fires when the app happens
// to be awake (i.e. there's been recent traffic) — best-effort, not a
// guaranteed SLA enforcement, until the app is on a plan that stays up.
@Injectable()
export class CasesSchedulerService {
  private readonly logger = new Logger(CasesSchedulerService.name);

  constructor(private readonly cases: CasesService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sweepStaleWaitingFarmerCases(): Promise<void> {
    const cutoff = new Date(Date.now() - WAITING_FARMER_SLA_HOURS * 60 * 60 * 1000);
    const stale = await this.cases.findStaleWaitingFarmer(cutoff);
    if (stale.length === 0) return;

    this.logger.log(`Auto-abandoning ${stale.length} case(s) past the ${WAITING_FARMER_SLA_HOURS}h Waiting Farmer SLA`);
    for (const { id } of stale) {
      try {
        await this.cases.abandon(id);
      } catch (error) {
        // One case's race with a farmer response (status changed between
        // the find and the abandon call) shouldn't stop the rest of the sweep.
        this.logger.warn(`Skipped auto-abandoning case ${id}: ${(error as Error).message}`);
      }
    }
  }
}
