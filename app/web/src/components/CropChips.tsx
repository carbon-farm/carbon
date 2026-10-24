import { useState } from 'react';
import { Bi, biInline } from '../i18n/Bi';

// Pick the crops a parcel grows by tapping chips from the master list, and add any other crop by
// typing its name — no commas to remember. The chosen crops are returned as plain names (what
// the parcel stores), so a crop that is not in the master list is kept exactly as typed.
export function CropChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [other, setOther] = useState('');
  const has = (name: string) => value.some((v) => v.trim().toLowerCase() === name.trim().toLowerCase());
  const toggle = (name: string) => onChange(has(name) ? value.filter((v) => v.trim().toLowerCase() !== name.trim().toLowerCase()) : [...value, name]);
  const extras = value.filter((v) => !options.some((o) => o.trim().toLowerCase() === v.trim().toLowerCase()));

  function addOther() {
    const name = other.trim();
    if (!name) return;
    if (!has(name)) onChange([...value, name]);
    setOther('');
  }

  return (
    <div className="field-group">
      <div className="chip-row" role="group" aria-label={biInline('cropsPickLabel')}>
        {[...options, ...extras].map((name) => (
          <button key={name} type="button" className={has(name) ? 'chip-on' : 'secondary'} aria-pressed={has(name)} onClick={() => toggle(name)}>
            {name}
          </button>
        ))}
      </div>
      <div className="chip-add">
        <input
          type="text"
          value={other}
          maxLength={60}
          placeholder={biInline('cropOtherPlaceholder')}
          aria-label={biInline('cropOtherPlaceholder')}
          onChange={(e) => setOther(e.target.value)}
          onBlur={addOther} // typed but not tapped Add: still counts when they move on to Save
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addOther();
            }
          }}
        />
        <button type="button" className="secondary" onClick={addOther} disabled={!other.trim()}>
          <Bi id="cropAddOtherButton" />
        </button>
      </div>
    </div>
  );
}
