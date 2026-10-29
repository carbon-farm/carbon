import { useEffect, useState } from 'react';
import { biInline } from '../i18n/Bi';

// Quantity with − / + buttons and a box that can be typed in freely: the number is only sent when
// the person leaves the box or presses Enter, so clearing it to type "12" never jumps to 1 and
// never fires a request per keystroke.
export function QuantityStepper({
  value,
  max,
  disabled,
  onCommit,
}: {
  value: number;
  max: number;
  disabled: boolean;
  onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  function commit(raw: string) {
    const n = Math.floor(Number(raw));
    if (!raw.trim() || !Number.isFinite(n) || n < 1) {
      setText(String(value)); // nothing sensible typed — put the old number back
      return;
    }
    const clamped = Math.min(n, max);
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  }

  return (
    <div className="qty-stepper">
      <button type="button" className="secondary qty-btn" aria-label={biInline('quantityLess')} disabled={disabled || value <= 1} onClick={() => onCommit(value - 1)}>
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={biInline('quantityLabel')}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(text);
          }
        }}
      />
      <button type="button" className="secondary qty-btn" aria-label={biInline('quantityMore')} disabled={disabled || value >= max} onClick={() => onCommit(value + 1)}>
        +
      </button>
    </div>
  );
}
