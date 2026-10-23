// "Products that may help" for an advice article: a transparent word-overlap match between the
// article (title, crop, symptoms, expert solution) and each product's name and description, in
// English and Telugu. Words that appear in many products count for little (so "water" and "spray"
// do not match everything); a word only one or two products use counts for a lot. No AI, no
// guesswork the shop owner cannot see — add the crop or problem to a product's description and it
// starts to match.

export interface RecProduct {
  id: string;
  name: string;
  description: string;
}

const STOP = new Set(
  (
    'the and for with from that this these those into onto over under have has had are was were been being will would can could ' +
    'should may might not but you your our their them they its use used using make made also than then when where which while ' +
    'what how why who whom per each any all more most some such only very just like about after before between during other ' +
    // everyday farm words that appear in almost every product and every article
    'water litre litres liter liters spray sprays drip flood irrigation mix mixed mixing apply applied application dose dosage ' +
    'plant plants leaf leaves crop crops field farm farmer farmers soil english telugu acre acres kilogram kilograms gram grams ' +
    'sample solution problem advice help good best well one two three four five six ten day days week weeks month months'
  ).split(' '),
);

// Telugu words take many endings, so match on the first few letters.
const TELUGU_STEM = 5;

const isAscii = (w: string) => [...w].every((c) => c.charCodeAt(0) < 128);

export function stems(text: string): string[] {
  const words = text.toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
  const out = new Set<string>();
  for (const w of words) {
    if (isAscii(w)) {
      if (w.length < 4 || /^\d+$/.test(w) || STOP.has(w)) continue;
      out.add(w.replace(/(ies)$/, 'y').replace(/(es|s)$/, ''));
    } else if (w.length >= 3) {
      out.add(w.slice(0, TELUGU_STEM));
    }
  }
  return [...out];
}

export const MIN_SCORE = 2.5;

export function recommend(
  article: { text: string; cropNames: string[] },
  products: RecProduct[],
  limit = 4,
): { id: string; score: number }[] {
  if (products.length === 0) return [];
  const articleStems = new Set([...stems(article.text), ...article.cropNames.flatMap((c) => stems(c))]);
  const cropStems = new Set(article.cropNames.flatMap((c) => stems(c)));

  const prepared = products.map((p) => ({ id: p.id, name: new Set(stems(p.name)), all: new Set([...stems(p.name), ...stems(p.description)]) }));
  const df = new Map<string, number>();
  for (const p of prepared) for (const s of p.all) df.set(s, (df.get(s) ?? 0) + 1);
  const n = products.length;
  const idf = (s: string) => Math.log((n + 1) / ((df.get(s) ?? 0) + 0.5));

  return prepared
    .map((p) => {
      let score = 0;
      for (const s of articleStems) {
        if (!p.all.has(s)) continue;
        score += idf(s) * (p.name.has(s) ? 2 : 1) * (cropStems.has(s) ? 1.5 : 1);
      }
      return { id: p.id, score };
    })
    .filter((r) => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
