import type { ElementType } from 'react';
import { strings, type Bilingual, type StringKey } from './strings';

interface BiProps {
  id: StringKey;
  as?: ElementType;
  className?: string;
}

// Renders the English line, then the Telugu line, stacked — the display
// pattern the product decision asked for everywhere, not just on some
// screens. `as` lets a heading render as <h1>/<h2> while a label still
// renders as plain text, without duplicating this markup at every call site.
export function Bi({ id, as: Tag = 'span', className }: BiProps) {
  const pair = strings[id];
  return <BiValue value={pair} as={Tag} className={className} />;
}

interface BiValueProps {
  value: Bilingual;
  as?: ElementType;
  className?: string;
}

// For interpolated strings (e.g. otpSentTo(mobileNumber)) that can't be a
// static dictionary key.
export function BiValue({ value, as: Tag = 'span', className }: BiValueProps) {
  return (
    <Tag className={className}>
      <span className="bi-en">{value.en}</span>
      <span className="bi-te">{value.te}</span>
    </Tag>
  );
}

// For contexts where JSX isn't possible — input placeholder/aria-label/title
// attributes — a single line, English then Telugu, separated visually.
export function biInline(id: StringKey): string {
  const pair = strings[id];
  return `${pair.en} / ${pair.te}`;
}
