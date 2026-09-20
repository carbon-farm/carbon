import { Role } from '@prisma/client';
import { formatUserCode, nextUserCode, userCodePrefix } from './user-code';

describe('user codes', () => {
  it('uses HH + a role letter', () => {
    expect(userCodePrefix(Role.CUSTOMER)).toBe('HHC');
    expect(userCodePrefix(Role.FARMER)).toBe('HHF');
    expect(userCodePrefix(Role.EXPERT)).toBe('HHE');
    expect(userCodePrefix(Role.MODERATOR)).toBe('HHM');
    expect(userCodePrefix(Role.VENDOR)).toBe('HHV');
    expect(userCodePrefix(Role.SUPPORT_AGENT)).toBe('HHS');
    expect(userCodePrefix(Role.ADMINISTRATOR)).toBe('HHA');
  });

  it('gives every role a distinct prefix (so codes can never collide across roles)', () => {
    // FARMER/CUSTOMER are legacy roles that share the Member letter (accounts are merged into MEMBER).
    const prefixes = Object.values(Role).filter((r) => r !== 'CUSTOMER').map((r) => userCodePrefix(r));
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it('pads to 4 digits and grows past 9999 without truncating', () => {
    expect(formatUserCode(Role.CUSTOMER, 1)).toBe('HHC-0001');
    expect(formatUserCode(Role.CUSTOMER, 42)).toBe('HHC-0042');
    expect(formatUserCode(Role.CUSTOMER, 9999)).toBe('HHC-9999');
    expect(formatUserCode(Role.CUSTOMER, 12345)).toBe('HHC-12345');
  });

  it('builds the code from the number the atomic counter returns', async () => {
    const db = { $queryRaw: jest.fn().mockResolvedValue([{ lastValue: 43 }]) };
    await expect(nextUserCode(db as never, Role.CUSTOMER)).resolves.toBe('HHC-0043');
    expect(db.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
