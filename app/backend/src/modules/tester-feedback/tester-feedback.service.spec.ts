import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TesterFeedbackService } from './tester-feedback.service';

const KEY = 'a'.repeat(32);

describe('TesterFeedbackService', () => {
  let prisma: any;
  let audit: { log: jest.Mock };
  let service: TesterFeedbackService;

  beforeEach(() => {
    prisma = {
      testerAccess: {
        findFirst: jest.fn().mockResolvedValue({ id: 'k1', key: KEY }),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'k1', ...data })),
        update: jest.fn().mockResolvedValue({}),
      },
      testerFeedback: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'f1', number: 1, ...data, comments: [] })),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'f1', status: 'NEW', _count: { comments: 0 } }),
        update: jest.fn().mockResolvedValue({}),
      },
      testerFeedbackComment: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'c1', ...data })),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new TesterFeedbackService(prisma, audit as never);
  });

  describe('the secret link', () => {
    it('accepts the right key and calls anything else "not found"', async () => {
      await expect(service.list(KEY)).resolves.toEqual([]);
      await expect(service.list('b'.repeat(32))).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.list('short')).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.list('')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('refuses everything while no link has been made yet', async () => {
      prisma.testerAccess.findFirst.mockResolvedValue(null);
      await expect(service.list(KEY)).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.create(KEY, { kind: 'BUG', description: 'something broke', authorName: 'Pavan' })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('makes a 32-character random key the first time the Administrator asks, and keeps it after', async () => {
      prisma.testerAccess.findFirst.mockResolvedValue(null);
      const key = await service.getLinkKey();
      expect(key).toMatch(/^[0-9a-f]{32}$/);
      expect(prisma.testerAccess.create).toHaveBeenCalledWith({ data: { key } });
      prisma.testerAccess.findFirst.mockResolvedValue({ id: 'k1', key });
      expect(await service.getLinkKey()).toBe(key);
    });

    it('replaces the key on rotate, which ends the old link, and records who did it', async () => {
      const key = await service.rotateLinkKey('admin-1');
      expect(key).toMatch(/^[0-9a-f]{32}$/);
      expect(key).not.toBe(KEY);
      expect(prisma.testerAccess.update).toHaveBeenCalledWith({ where: { id: 'k1' }, data: { key, rotatedAt: expect.any(Date) } });
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ actorId: 'admin-1', action: 'tester_board.link.rotate' }));
    });
  });

  describe('adding an item', () => {
    it('saves it as plain trimmed text, with the control characters removed', async () => {
      await service.create(KEY, { kind: 'BUG', location: ' Dashboard → Farm advice ', description: '  Add to cart\u0000 is hidden  ', expected: ' ', authorName: ' Pavan ' });
      expect(prisma.testerFeedback.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { kind: 'BUG', location: 'Dashboard → Farm advice', description: 'Add to cart is hidden', expected: null, authorName: 'Pavan' } }),
      );
    });

    it('quietly drops an item whose hidden trap box is filled (a bot)', async () => {
      await expect(service.create(KEY, { kind: 'BUG', description: 'buy cheap pills', authorName: 'x', faxExtra: 'http://spam' })).resolves.toEqual({ ok: true });
      expect(prisma.testerFeedback.create).not.toHaveBeenCalled();
    });

    it('refuses a blank name or a description that is blank after trimming', async () => {
      await expect(service.create(KEY, { kind: 'BUG', description: '       ', authorName: 'Pavan' })).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.create(KEY, { kind: 'BUG', description: 'something broke', authorName: '   ' })).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.testerFeedback.create).not.toHaveBeenCalled();
    });

    it('refuses new items once the board is full', async () => {
      prisma.testerFeedback.count.mockResolvedValue(5000);
      await expect(service.create(KEY, { kind: 'BUG', description: 'something broke', authorName: 'Pavan' })).rejects.toThrow(/full/);
    });
  });

  describe('replies', () => {
    it('adds a reply, trimmed', async () => {
      await service.comment(KEY, 'f1', { authorName: ' Vamshi ', body: ' fixed on my phone ' });
      expect(prisma.testerFeedbackComment.create).toHaveBeenCalledWith({ data: { feedbackId: 'f1', authorName: 'Vamshi', body: 'fixed on my phone' } });
    });

    it('drops a bot reply, refuses a blank one, and stops at 200 replies on one item', async () => {
      await expect(service.comment(KEY, 'f1', { authorName: 'x', body: 'spam', faxExtra: 'y' })).resolves.toEqual({ ok: true });
      await expect(service.comment(KEY, 'f1', { authorName: 'Vamshi', body: '   ' })).rejects.toBeInstanceOf(BadRequestException);
      prisma.testerFeedback.findUnique.mockResolvedValue({ id: 'f1', _count: { comments: 200 } });
      await expect(service.comment(KEY, 'f1', { authorName: 'Vamshi', body: 'one more' })).rejects.toThrow(/too many replies/);
      expect(prisma.testerFeedbackComment.create).not.toHaveBeenCalled();
    });

    it('says "not found" for an item that does not exist', async () => {
      prisma.testerFeedback.findUnique.mockResolvedValue(null);
      await expect(service.comment(KEY, 'nope', { authorName: 'Vamshi', body: 'hello' })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('stops when the whole board holds 20000 replies', async () => {
      prisma.testerFeedbackComment.count.mockResolvedValue(20000);
      await expect(service.comment(KEY, 'f1', { authorName: 'Vamshi', body: 'one more' })).rejects.toThrow(/full of replies/);
      expect(prisma.testerFeedbackComment.create).not.toHaveBeenCalled();
    });

    it('strips invisible direction and zero-width characters from names and text', async () => {
      await service.comment(KEY, 'f1', { authorName: 'Va‮mshi​', body: 'he​llo' });
      expect(prisma.testerFeedbackComment.create).toHaveBeenCalledWith({ data: { feedbackId: 'f1', authorName: 'Vamshi', body: 'hello' } });
    });
  });

  describe('status', () => {
    it('changes the status and writes who did it into the item\'s history', async () => {
      await service.setStatus(KEY, 'f1', { status: 'DONE', by: ' Vamshi ' });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.testerFeedbackComment.create).toHaveBeenCalledWith({
        data: {
          feedbackId: 'f1',
          authorName: 'Vamshi',
          isSystem: true,
          body: 'Status: New → Done (by Vamshi) / స్థితి: కొత్త → పూర్తయింది (Vamshi)',
        },
      });
    });

    it('still changes the status, but writes no history line, once the item or board is full of replies', async () => {
      prisma.testerFeedbackComment.count.mockResolvedValueOnce(200).mockResolvedValueOnce(300);
      await service.setStatus(KEY, 'f1', { status: 'DONE', by: 'Vamshi' });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(1);
      expect(prisma.testerFeedbackComment.create).not.toHaveBeenCalled();
    });

    it('does nothing when the status is already that', async () => {
      await service.setStatus(KEY, 'f1', { status: 'NEW', by: 'Vamshi' });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('needs a name, and the right key', async () => {
      await expect(service.setStatus(KEY, 'f1', { status: 'DONE', by: '  ' })).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.setStatus('b'.repeat(32), 'f1', { status: 'DONE', by: 'Vamshi' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
