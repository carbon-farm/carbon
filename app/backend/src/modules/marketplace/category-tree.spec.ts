import { descendantIds, levelOf } from './category-tree';

const nodes = [
  { id: 'dept', parentId: null },
  { id: 'cat', parentId: 'dept' },
  { id: 'sub', parentId: 'cat' },
  { id: 'cat2', parentId: 'dept' },
  { id: 'other', parentId: null },
];

describe('category tree', () => {
  it('levels: department 0, category 1, sub-category 2', () => {
    expect(levelOf(nodes, 'dept')).toBe(0);
    expect(levelOf(nodes, 'cat')).toBe(1);
    expect(levelOf(nodes, 'sub')).toBe(2);
  });
  it('a department includes everything beneath it, and nothing from other departments', () => {
    expect(descendantIds(nodes, 'dept').sort()).toEqual(['cat', 'cat2', 'dept', 'sub']);
    expect(descendantIds(nodes, 'cat').sort()).toEqual(['cat', 'sub']);
    expect(descendantIds(nodes, 'sub')).toEqual(['sub']);
  });
  it('does not loop forever on bad data', () => {
    const cyclic = [
      { id: 'a', parentId: 'b' },
      { id: 'b', parentId: 'a' },
    ];
    expect(descendantIds(cyclic, 'a').sort()).toEqual(['a', 'b']);
    expect(levelOf(cyclic, 'a')).toBeLessThan(5);
  });
});
