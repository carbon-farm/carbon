import { CasesSchedulerService } from './cases.scheduler';
import { CasesService } from './cases.service';

describe('CasesSchedulerService', () => {
  let cases: { findStaleWaitingFarmer: jest.Mock; abandon: jest.Mock };
  let scheduler: CasesSchedulerService;

  beforeEach(() => {
    cases = { findStaleWaitingFarmer: jest.fn(), abandon: jest.fn() };
    scheduler = new CasesSchedulerService(cases as unknown as CasesService);
  });

  it('does nothing when no cases are past the SLA window', async () => {
    cases.findStaleWaitingFarmer.mockResolvedValue([]);
    await scheduler.sweepStaleWaitingFarmerCases();
    expect(cases.abandon).not.toHaveBeenCalled();
  });

  it('auto-abandons every stale case with no actor (a system-triggered close)', async () => {
    cases.findStaleWaitingFarmer.mockResolvedValue([{ id: 'case-1' }, { id: 'case-2' }]);
    cases.abandon.mockResolvedValue(undefined);

    await scheduler.sweepStaleWaitingFarmerCases();

    expect(cases.abandon).toHaveBeenCalledWith('case-1');
    expect(cases.abandon).toHaveBeenCalledWith('case-2');
    expect(cases.abandon).toHaveBeenCalledTimes(2);
  });

  it('keeps sweeping the rest of the batch if one case fails to abandon', async () => {
    cases.findStaleWaitingFarmer.mockResolvedValue([{ id: 'case-1' }, { id: 'case-2' }]);
    cases.abandon.mockRejectedValueOnce(new Error('status changed mid-sweep')).mockResolvedValueOnce(undefined);

    await expect(scheduler.sweepStaleWaitingFarmerCases()).resolves.not.toThrow();
    expect(cases.abandon).toHaveBeenCalledTimes(2);
  });
});
