import type { Audience } from '../tour/steps';
import { FAQS, faqsFor, type Faq } from './faq';

// Picks the FAQ that best answers a typed question. No server and no AI — it scores each
// entry's keywords against the question, so it works offline, costs nothing, and gives the
// same answer every time. Works for English, Telugu script, and Telugu typed in English letters.

export interface FaqMatch {
  faq: Faq;
  score: number;
}

export interface FaqAnswer {
  best: FaqMatch | null;
  // Other close entries, offered as follow-up suggestions.
  related: Faq[];
  // True when the best answer belongs to another kind of account than the asker's.
  otherAudience: boolean;
}

// Below this the question is treated as "not understood".
export const MIN_SCORE = 3;

// Words that carry no meaning in a question. Negations (not, cannot, cant) are NOT here:
// "cannot add" and "can add" are different questions.
const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'am', 'i', 'my', 'me', 'to', 'do', 'does', 'how', 'what', 'where', 'when', 'why', 'can', 'could',
  'should', 'of', 'in', 'on', 'for', 'and', 'or', 'it', 'this', 'that', 'with', 'please', 'want', 'need',
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[‌‍]/g, '') // zero-width joiners Telugu keyboards insert
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const isAscii = (s: string) => /^[\x00-\x7f]*$/.test(s);

// True when `needle` occurs in `haystack`. A single English word must be a whole word (allowing a
// plural or -ed/-ing ending), so "members" does not match "membership" and "id" does not match
// "paid". Phrases and Telugu text match anywhere, since Telugu words take many endings.
function contains(haystack: string, needle: string): boolean {
  if (!needle) return false;
  if (isAscii(needle) && !needle.includes(' ')) {
    return new RegExp(`(^|\\s)${needle}(s|es|ed|ing)?(\\s|$)`).test(haystack);
  }
  return haystack.includes(needle);
}

// Does the query contain every meaningful word of a multi-word keyword, in any order and with
// word endings ignored (so "create an account" matches the keyword "create account", and
// Telugu "ఖాతాను" matches "ఖాతా")?
function wordsPresent(queryTokens: string[], phrase: string): boolean {
  const words = phrase.split(' ').filter((w) => !STOP.has(w));
  if (words.length < 2) return false;
  return words.every((w) =>
    queryTokens.some((t) => t === w || (w.length >= 4 && t.startsWith(w)) || (t.length >= 5 && w.startsWith(t))),
  );
}

// Points for keyword hits only; shared words with the question text are added on top by the
// caller and can never create a match by themselves.
function keywordScore(query: string, queryTokens: string[], faq: Faq): number {
  let total = 0;
  for (const raw of faq.keywords) {
    const k = normalize(raw);
    if (!k) continue;
    const multi = k.includes(' ');
    if (contains(query, k) || (multi && wordsPresent(queryTokens, k))) {
      // Longer, more specific phrases are stronger evidence than a single common word.
      total += multi ? 4 : k.length >= 6 ? 3 : k.length === 3 ? 3 : 2;
    }
  }
  return total;
}

function score(query: string, queryTokens: string[], tokens: Set<string>, faq: Faq): number {
  const base = keywordScore(query, queryTokens, faq);
  if (base === 0) return 0;
  let total = base;
  // A little credit for sharing meaningful words with the question itself.
  const qWords = normalize(`${faq.q.en} ${faq.q.te}`).split(' ');
  for (const w of qWords) {
    if (w.length > 3 && !STOP.has(w) && tokens.has(w)) total += 1;
  }
  return total;
}

export function rank(query: string, pool: Faq[]): FaqMatch[] {
  const q = normalize(query);
  if (!q) return [];
  const queryTokens = q.split(' ');
  const tokens = new Set(queryTokens.filter((w) => !STOP.has(w)));
  return pool
    .map((faq) => ({ faq, score: score(q, queryTokens, tokens, faq) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function answer(query: string, audience: Audience): FaqAnswer {
  const own = faqsFor(audience);
  const ownRanked = rank(query, own);
  if (ownRanked[0] && ownRanked[0].score >= MIN_SCORE) {
    return { best: ownRanked[0], related: ownRanked.slice(1, 4).filter((m) => m.score >= MIN_SCORE - 1).map((m) => m.faq), otherAudience: false };
  }
  // Maybe they asked about something for a different kind of account (an administrator asking
  // how a member pays). Answer it, but say so.
  const allRanked = rank(query, FAQS);
  if (allRanked[0] && allRanked[0].score >= MIN_SCORE) {
    return { best: allRanked[0], related: [], otherAudience: true };
  }
  return { best: null, related: ownRanked.slice(0, 3).map((m) => m.faq), otherAudience: false };
}

export function popularFor(audience: Audience): Faq[] {
  return faqsFor(audience).filter((f) => f.popular).slice(0, 5);
}
