import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSettingsDto } from './update-settings.dto';

const errorsFor = async (body: Record<string, unknown>) =>
  (await validate(plainToInstance(UpdateSettingsDto, body))).map((e) => e.property).sort();

describe('UpdateSettingsDto — UPI IDs', () => {
  it('accepts normal UPI IDs, and no price (prices live on the plans now)', async () => {
    expect(await errorsFor({ primaryUpiId: 'hariharaanaturalfoodstores@okaxis' })).toEqual([]);
    expect(await errorsFor({ primaryUpiId: 'shop.name-1_x@ybl', secondaryUpiId: '9876543210@paytm' })).toEqual([]);
  });
  it('refuses something that is not a UPI ID, so a typo cannot break every payment link', async () => {
    expect(await errorsFor({ primaryUpiId: 'shop' })).toEqual(['primaryUpiId']);
    expect(await errorsFor({ primaryUpiId: 'shop @okaxis' })).toEqual(['primaryUpiId']);
    expect(await errorsFor({ primaryUpiId: 'shop@' })).toEqual(['primaryUpiId']);
    expect(await errorsFor({ primaryUpiId: 'ab@okaxis', secondaryUpiId: 'nonsense' })).toEqual(['secondaryUpiId']);
  });
  it('an empty spare UPI ID means "remove it" and is allowed', async () => {
    expect(await errorsFor({ primaryUpiId: 'a1@okaxis', secondaryUpiId: '' })).toEqual([]);
  });
});
