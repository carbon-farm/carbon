import { recommend, stems } from './recommend';

const products = [
  { id: 'mg', name: 'Magnesium Sulphate', description: 'English: Corrects magnesium deficiency. Spray: 1.2kg in 200L water. Telugu: మొక్కలలో మెగ్నీషియం లోపాన్ని సరిచేయడానికి ఉపయోగిస్తారు.' },
  { id: 'si', name: 'Non-ionic Silicon Spreader', description: 'English: Mix 20mL in 200 litres of water with any spray to help solutions spread and stick to leaves.' },
  { id: 'neem', name: 'Neem Oil', description: 'English: Controls aphids, whitefly and other sucking pests on chilli and cotton. Telugu: పేనుబంక, తెల్లదోమ నివారణ.' },
  { id: 'honey', name: 'Forest Honey', description: 'English: Raw honey. Mix with warm water.' },
  { id: 'fish', name: 'Fish Amino Acid', description: 'English: Growth booster for vegetables. Spray 3ml per litre of water.' },
];

describe('recommend', () => {
  it('finds the product that names the problem', () => {
    const r = recommend({ text: 'Magnesium deficiency in chilli: yellowing between the veins of older leaves', cropNames: ['Chilli'] }, products);
    expect(r[0].id).toBe('mg');
  });

  it('matches pests to the product that controls them, by crop too', () => {
    const r = recommend({ text: 'Aphids and whitefly sucking sap on chilli seedlings', cropNames: ['Chilli'] }, products);
    expect(r[0].id).toBe('neem');
  });

  it('matches Telugu text', () => {
    const r = recommend({ text: 'మొక్కలలో మెగ్నీషియం లోపం కనిపిస్తోంది', cropNames: [] }, products);
    expect(r[0].id).toBe('mg');
  });

  it('does not match everything on common words like water and spray', () => {
    const r = recommend({ text: 'Spray water on the plants every morning and mix well', cropNames: [] }, products);
    expect(r).toEqual([]);
  });

  it('returns nothing for an unrelated article and for an empty catalog', () => {
    expect(recommend({ text: 'Termite damage to timber fence posts', cropNames: [] }, products)).toEqual([]);
    expect(recommend({ text: 'anything', cropNames: [] }, [])).toEqual([]);
  });

  it('caps the number returned', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, name: `Magnesium booster ${i}`, description: 'magnesium deficiency' }));
    expect(recommend({ text: 'magnesium deficiency', cropNames: [] }, [...many, products[3]], 3).length).toBeLessThanOrEqual(3);
  });
});

describe('stems', () => {
  it('drops short, numeric and everyday words and folds plurals', () => {
    expect(stems('The 200 litres of water, aphids and leaves')).toEqual(['aphid']);
  });
});
