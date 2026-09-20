import { addressSnapshot, formatAddress, normalizePhone } from './address-format';

const a = { recipientName: 'Ravi', phone: '9876543210', line1: '12-3 Main Rd', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' };

describe('address format', () => {
  it('normalizes phone numbers to 10 digits', () => {
    expect(normalizePhone('+91 98765-43210')).toBe('9876543210');
    expect(normalizePhone('098765 43210')).toBe('9876543210');
    expect(normalizePhone('9876543210')).toBe('9876543210');
  });
  it('formats one readable block, skipping empty parts', () => {
    expect(formatAddress(a)).toBe('Ravi, 9876543210, 12-3 Main Rd, Guntur, Andhra Pradesh 522001');
    expect(formatAddress({ ...a, line2: 'Near temple', landmark: 'Bus stand', alternatePhone: '9000000001' })).toBe(
      'Ravi, 9876543210 / 9000000001, 12-3 Main Rd, Near temple, Landmark: Bus stand, Guntur, Andhra Pradesh 522001',
    );
  });
  it('snapshot carries every field, nulling the optional ones', () => {
    expect(addressSnapshot(a)).toEqual({ ...a, alternatePhone: null, email: null, line2: null, landmark: null });
  });
});
