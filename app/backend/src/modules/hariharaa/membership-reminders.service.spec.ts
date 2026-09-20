import { MembershipRemindersService } from './membership-reminders.service';

const DAY = 864e5;
const at = (n: number) => new Date(Date.now() + n * DAY);

describe('MembershipRemindersService', () => {
  let prisma: any;
  let notifications: { create: jest.Mock };
  let plans: { isMembershipRequired: jest.Mock };
  let service: MembershipRemindersService;

  const sub = (over: Record<string, unknown> = {}) => ({
    userId: 'u1', activeUntil: at(2), complimentaryUntil: null, expiryReminderFor: null, expiredNoticeFor: null, ...over,
  });

  beforeEach(() => {
    prisma = {
      hariharaaSubscription: {
        findUnique: jest.fn().mockResolvedValue(sub()),
        findMany: jest.fn().mockResolvedValue([{ userId: 'u1' }]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      hariharaaPayment: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    notifications = { create: jest.fn().mockResolvedValue(undefined) };
    plans = { isMembershipRequired: jest.fn().mockResolvedValue(true) };
    service = new MembershipRemindersService(prisma, notifications as any, plans as any);
  });

  it('sends the "ends soon" notice once, links to the membership page, and marks that end date', async () => {
    const due = await service.remindIfDue('u1');
    expect(due).toMatchObject({ kind: 'EXPIRING' });
    expect(notifications.create).toHaveBeenCalledWith('u1', 'membership.expiring', expect.stringContaining('ends soon'), expect.stringMatching(/2 days|3 days/), '/hariharaa/subscription');
    expect(prisma.hariharaaSubscription.updateMany.mock.calls[0][0].data).toHaveProperty('expiryReminderFor');
  });

  it('marks with a condition that also matches a never-reminded (NULL) member — NOT (col = x) would not', async () => {
    await service.remindIfDue('u1');
    const where = prisma.hariharaaSubscription.updateMany.mock.calls[0][0].where;
    expect(where.OR[0]).toEqual({ expiryReminderFor: null });
  });

  it('says "free access" for a free grant that is ending', async () => {
    prisma.hariharaaSubscription.findUnique.mockResolvedValue(sub({ activeUntil: null, complimentaryUntil: at(1) }));
    await service.remindIfDue('u1');
    expect(notifications.create.mock.calls[0][2]).toMatch(/free access/i);
  });

  it('sends the "has ended" notice once access has lapsed', async () => {
    prisma.hariharaaSubscription.findUnique.mockResolvedValue(sub({ activeUntil: at(-0.5) }));
    expect(await service.remindIfDue('u1')).toMatchObject({ kind: 'EXPIRED' });
    expect(notifications.create).toHaveBeenCalledWith('u1', 'membership.expired', expect.any(String), expect.any(String), '/hariharaa/subscription');
    expect(prisma.hariharaaSubscription.updateMany.mock.calls[0][0].data).toHaveProperty('expiredNoticeFor');
  });

  it('does nothing when the end date was already announced', async () => {
    const until = at(2);
    prisma.hariharaaSubscription.findUnique.mockResolvedValue(sub({ activeUntil: until, expiryReminderFor: until }));
    expect(await service.remindIfDue('u1')).toBeNull();
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('two callers at once cannot both send it (the loser of the mark sends nothing)', async () => {
    prisma.hariharaaSubscription.updateMany.mockResolvedValue({ count: 0 });
    expect(await service.remindIfDue('u1')).toBeNull();
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('does not nag someone whose renewal is already waiting for verification', async () => {
    prisma.hariharaaPayment.findFirst.mockResolvedValue({ id: 'p1' });
    expect(await service.remindIfDue('u1')).toBeNull();
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('sends nothing while membership is switched off', async () => {
    plans.isMembershipRequired.mockResolvedValue(false);
    expect(await service.remindIfDue('u1')).toBeNull();
    expect(await service.sweep()).toBe(0);
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('the hourly sweep reminds everyone due, and one failure does not stop the rest', async () => {
    prisma.hariharaaSubscription.findMany.mockResolvedValue([{ userId: 'u1' }, { userId: 'u2' }, { userId: 'u3' }]);
    prisma.hariharaaSubscription.findUnique
      .mockResolvedValueOnce(sub())
      .mockRejectedValueOnce(new Error('db hiccup'))
      .mockResolvedValueOnce(sub({ userId: 'u3' }));
    expect(await service.sweep()).toBe(2);
    expect(notifications.create).toHaveBeenCalledTimes(2);
  });
});
