import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('accepts a valid Indian mobile number, an 8+ char password, and a name', async () => {
    const dto = plainToInstance(RegisterDto, {
      mobileNumber: '+919876543210',
      password: 'chilliFarm2026',
      name: 'Ravi Kumar',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const dto = plainToInstance(RegisterDto, {
      mobileNumber: '+919876543210',
      password: 'short1',
      name: 'Ravi Kumar',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects a non-Indian-format mobile number', async () => {
    const dto = plainToInstance(RegisterDto, {
      mobileNumber: 'not-a-phone-number',
      password: 'chilliFarm2026',
      name: 'Ravi Kumar',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'mobileNumber')).toBe(true);
  });

  it('rejects a missing name', async () => {
    const dto = plainToInstance(RegisterDto, {
      mobileNumber: '+919876543210',
      password: 'chilliFarm2026',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });
});
