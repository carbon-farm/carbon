import { compactCode, isUniqueViolation, istStamp, numberPrefix, withSequence } from './readable-number';

describe('readable numbers', () => {
  it('writes the member code without the hyphen', () => {
    expect(compactCode('HHC-0003')).toBe('HHC0003');
    expect(compactCode('hhf-0016')).toBe('HHF0016');
    expect(compactCode(null)).toBe('HHX0000');
  });

  it('uses the date in India, not the server clock', () => {
    expect(istStamp(new Date('2026-10-24T19:00:00Z'))).toBe('20261025'); // 00:30 IST on the 25th
    expect(istStamp(new Date('2026-10-24T17:00:00Z'))).toBe('20261024');
    expect(istStamp(new Date('2026-12-31T19:00:00Z'))).toBe('20270101');
  });

  it('builds the number a member would recognise', () => {
    const prefix = numberPrefix('CASE', 'HHC-0003', new Date('2026-10-24T06:00:00Z'));
    expect(prefix).toBe('CASE-HHC0003-20261024-');
    expect(withSequence(prefix, 1)).toBe('CASE-HHC0003-20261024-001');
    expect(withSequence(numberPrefix('ORD', 'HHC-0003', new Date('2026-10-24T06:00:00Z')), 12)).toBe('ORD-HHC0003-20261024-012');
    expect(withSequence(prefix, 1234)).toBe('CASE-HHC0003-20261024-1234');
  });

  it('recognises a unique-constraint failure', () => {
    expect(isUniqueViolation({ code: 'P2002' })).toBe(true);
    expect(isUniqueViolation({ code: 'P2025' })).toBe(false);
    expect(isUniqueViolation(new Error('x'))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});
