import { validate } from 'class-validator';
import { ClaimPaymentDto } from './claim-payment.dto';

const check = async (utr: unknown) => {
  const dto = Object.assign(new ClaimPaymentDto(), { utr });
  return (await validate(dto)).length === 0;
};

describe('ClaimPaymentDto.utr', () => {
  it('accepts a normal 12-digit UPI reference', async () => {
    expect(await check('412345678901')).toBe(true);
  });
  it('accepts a reference pasted with surrounding spaces or a newline', async () => {
    expect(await check('  412345678901 ')).toBe(true);
    expect(await check('412345678901\n')).toBe(true);
  });
  it('accepts letters, digits and separators (gateway-style ids)', async () => {
    expect(await check('pay_Abc123-XYZ')).toBe(true);
  });
  it('rejects too-short, empty or junk values', async () => {
    expect(await check('123')).toBe(false);
    expect(await check('   ')).toBe(false);
    expect(await check('has spaces inside')).toBe(false);
    expect(await check('<script>alert(1)</script>')).toBe(false);
    expect(await check(undefined)).toBe(false);
  });
});
