import { Role } from '@prisma/client';
import { ReleasesService } from './releases.service';
import { RELEASE_NOTES } from './release-notes';

describe('ReleasesService', () => {
  const make = (alreadyAnnounced: string[] = []) => {
    const prisma = {
      auditLog: { findFirst: jest.fn().mockImplementation(async ({ where }) => (alreadyAnnounced.includes(where.entityId) ? { id: 'x' } : null)) },
    };
    const audit = { log: jest.fn().mockResolvedValue(undefined) };
    const notifications = { notifyRole: jest.fn().mockResolvedValue(undefined) };
    return { prisma, audit, notifications, service: new ReleasesService(prisma as never, audit as never, notifications as never) };
  };
  const notes = [
    { id: 'a', title: 'A', body: 'a' },
    { id: 'b', title: 'B', body: 'b', linkPath: '/admin' },
  ];

  it('tells all administrators about a new update and records it', async () => {
    const { service, notifications, audit } = make();
    expect(await service.announceNew(notes)).toEqual(['a', 'b']);
    expect(notifications.notifyRole).toHaveBeenCalledWith(Role.ADMINISTRATOR, 'release.update', 'B', 'b', '/admin');
    expect(audit.log).toHaveBeenCalledWith({ action: 'release.announced', entityType: 'Release', entityId: 'a' });
  });

  it('never repeats an update it has already announced', async () => {
    const { service, notifications } = make(['a']);
    expect(await service.announceNew(notes)).toEqual(['b']);
    expect(notifications.notifyRole).toHaveBeenCalledTimes(1);
  });

  it('does nothing when everything was announced', async () => {
    const { service, notifications } = make(['a', 'b']);
    expect(await service.announceNew(notes)).toEqual([]);
    expect(notifications.notifyRole).not.toHaveBeenCalled();
  });

  it('a failure while announcing never stops the server starting', async () => {
    const { service, prisma } = make();
    prisma.auditLog.findFirst.mockRejectedValue(new Error('db down'));
    await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
  });

  it('every release note has a unique id and English and Telugu text', () => {
    const ids = RELEASE_NOTES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const n of RELEASE_NOTES) {
      expect(n.title).toMatch(/ \/ /);
      expect(n.body).toMatch(/ \/ /);
      expect(/[ఀ-౿]/.test(n.title) && /[ఀ-౿]/.test(n.body)).toBe(true);
    }
  });
});
