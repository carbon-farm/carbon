import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFarmLandDto } from './create-farm-land.dto';

describe('CreateFarmLandDto', () => {
  it('accepts a valid Farm/Land parcel', async () => {
    const dto = plainToInstance(CreateFarmLandDto, {
      label: 'North field',
      address: 'Guntur, Andhra Pradesh',
      landSizeAcres: 2,
      primaryCrops: ['Chilli'],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-positive land size', async () => {
    const dto = plainToInstance(CreateFarmLandDto, {
      label: 'North field',
      address: 'Guntur, Andhra Pradesh',
      landSizeAcres: 0,
      primaryCrops: ['Chilli'],
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'landSizeAcres')).toBe(true);
  });

  it('rejects an empty primaryCrops list — a parcel with no declared crop is not useful data', async () => {
    const dto = plainToInstance(CreateFarmLandDto, {
      label: 'North field',
      address: 'Guntur, Andhra Pradesh',
      landSizeAcres: 2,
      primaryCrops: [],
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'primaryCrops')).toBe(true);
  });
});
