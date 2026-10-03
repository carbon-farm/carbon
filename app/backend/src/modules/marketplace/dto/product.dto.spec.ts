import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdjustStockDto, CreateProductDto, UpdateProductDto } from './product.dto';

const bad = async <T extends object>(cls: new () => T, body: Record<string, unknown>) =>
  (await validate(plainToInstance(cls, body))).map((e) => e.property).sort();

const ok = { name: 'Cold Pressed Oil', description: 'Fresh groundnut oil, pressed weekly', price: 350, unit: 'per litre', stockQuantity: 20 };

describe('CreateProductDto', () => {
  it('accepts a normal product', async () => expect(await bad(CreateProductDto, ok)).toEqual([]));
  it('price: never free by accident, two decimals at most, and a sane ceiling', async () => {
    expect(await bad(CreateProductDto, { ...ok, price: 0 })).toEqual(['price']);
    expect(await bad(CreateProductDto, { ...ok, price: -5 })).toEqual(['price']);
    expect(await bad(CreateProductDto, { ...ok, price: 19.999 })).toEqual(['price']);
    expect(await bad(CreateProductDto, { ...ok, price: 1e12 })).toEqual(['price']);
    expect(await bad(CreateProductDto, { ...ok, price: 0.01 })).toEqual([]);
    expect(await bad(CreateProductDto, { ...ok, price: 19.99 })).toEqual([]);
  });
  it('stock: whole numbers, not negative, and small enough for the database', async () => {
    expect(await bad(CreateProductDto, { ...ok, stockQuantity: -1 })).toEqual(['stockQuantity']);
    expect(await bad(CreateProductDto, { ...ok, stockQuantity: 2.5 })).toEqual(['stockQuantity']);
    expect(await bad(CreateProductDto, { ...ok, stockQuantity: 5e9 })).toEqual(['stockQuantity']);
    expect(await bad(CreateProductDto, { ...ok, stockQuantity: 0 })).toEqual([]);
  });
  it('name, description and unit are required and bounded', async () => {
    expect(await bad(CreateProductDto, { ...ok, name: 'ab' })).toEqual(['name']);
    expect(await bad(CreateProductDto, { ...ok, description: 'too short' })).toEqual(['description']);
    expect(await bad(CreateProductDto, { ...ok, unit: '' })).toEqual(['unit']);
    expect(await bad(CreateProductDto, { ...ok, unit: undefined })).toEqual(['unit']);
    expect(await bad(CreateProductDto, { ...ok, name: 'x'.repeat(121) })).toEqual(['name']);
  });
  it('category must be an id when given', async () => expect(await bad(CreateProductDto, { ...ok, categoryId: 'nope' })).toEqual(['categoryId']));
});

describe('UpdateProductDto', () => {
  it('everything optional, same limits when given', async () => {
    expect(await bad(UpdateProductDto, {})).toEqual([]);
    expect(await bad(UpdateProductDto, { price: 0 })).toEqual(['price']);
    expect(await bad(UpdateProductDto, { stockQuantity: -3 })).toEqual(['stockQuantity']);
    expect(await bad(UpdateProductDto, { isActive: false, price: 12.5 })).toEqual([]);
  });
});

describe('AdjustStockDto', () => {
  it('accepts add, reduce and set', async () => {
    for (const mode of ['ADD', 'REDUCE', 'SET']) expect(await bad(AdjustStockDto, { mode, quantity: 5, reason: 'x' })).toEqual([]);
  });
  it('refuses an unknown mode, a fraction, a negative and an absurd quantity', async () => {
    expect(await bad(AdjustStockDto, { mode: 'DELETE', quantity: 5 })).toEqual(['mode']);
    expect(await bad(AdjustStockDto, { mode: 'ADD', quantity: 1.5 })).toEqual(['quantity']);
    expect(await bad(AdjustStockDto, { mode: 'ADD', quantity: -1 })).toEqual(['quantity']);
    expect(await bad(AdjustStockDto, { mode: 'ADD', quantity: 5e9 })).toEqual(['quantity']);
  });
});
