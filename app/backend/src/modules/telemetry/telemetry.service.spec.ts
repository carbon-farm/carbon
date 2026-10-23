import { sanitizeEvent, TelemetryService } from './telemetry.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('sanitizeEvent', () => {
  it('keeps a normal page view', () => {
    expect(sanitizeEvent({ kind: 'page', name: '/marketplace', role: 'MEMBER' })).toEqual({ kind: 'page', name: '/marketplace', detail: null, role: 'MEMBER' });
  });

  it('drops unknown kinds and empty names', () => {
    expect(sanitizeEvent({ kind: 'hack', name: 'x' })).toBeNull();
    expect(sanitizeEvent({ kind: 'page', name: '   ' })).toBeNull();
  });

  it('removes mobile numbers and long tokens people may type into the help chat', () => {
    const e = sanitizeEvent({ kind: 'chat_unanswered', name: 'my number is 9876543210 and +91 98765 43210 help', detail: 'token ' + 'a'.repeat(40) });
    expect(e?.name).not.toMatch(/\d{10}/);
    expect(e?.name).toContain('[number]');
    expect(e?.detail).toContain('[token]');
  });

  it('truncates long text and ignores a malformed role', () => {
    const e = sanitizeEvent({ kind: 'error', name: 'x y '.repeat(100), detail: 'y '.repeat(2000), role: 'drop table' });
    expect(e?.name.length).toBeLessThanOrEqual(200);
    expect(e?.detail?.length).toBeLessThanOrEqual(1000);
    expect(e?.role).toBeNull();
  });
});

describe('TelemetryService.record', () => {
  it('stores at most 20 valid events and skips junk', async () => {
    const createMany = jest.fn().mockResolvedValue({});
    const service = new TelemetryService({ usageEvent: { createMany } } as unknown as PrismaService);
    const events = Array.from({ length: 30 }, (_, i) => ({ kind: i % 5 === 0 ? 'bad' : 'page', name: `/p${i}` }));
    const stored = await service.record(events);
    expect(stored).toBeLessThanOrEqual(20);
    expect(createMany.mock.calls[0][0].data.every((r: { kind: string }) => r.kind === 'page')).toBe(true);
  });
});
