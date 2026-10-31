import { useState } from 'react';
import { biInline } from '../i18n/Bi';
import type { Crop } from '../api/configuration';
import { buildGroups, cropLabel, flatGroups, matchesCrop } from '../lib/crops';
import { useCropCategories } from '../lib/useCropCategories';

// Pick one crop from a long list: crops grouped under their group names (a sub-group reads
// "Vegetables › Fruiting vegetables"), each shown as "Tomato / టమోటా", with a search box above that
// narrows the list (English or Telugu). Works controlled (value/onChange) or inside a form
// (name + defaultValue).
export function CropSelect({
  crops,
  name,
  value,
  defaultValue = '',
  onChange,
  emptyLabel,
  extraOptions = [],
  ariaLabel,
}: {
  crops: Crop[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  // text of the "nothing chosen" choice (value ""); leave out for no such choice
  emptyLabel?: string;
  // more choices at the end, e.g. "Other crop"
  extraOptions?: { value: string; label: string }[];
  ariaLabel?: string;
}) {
  const { categories } = useCropCategories();
  const [inner, setInner] = useState(defaultValue);
  const [query, setQuery] = useState('');
  const current = value ?? inner;
  const q = query.trim();
  const shown = q ? crops.filter((c) => matchesCrop(c, q, categories)) : crops;
  const selected = crops.find((c) => c.id === current);
  // keep the chosen crop in the list even when the search no longer matches it
  const keepSelected = selected && !shown.some((c) => c.id === selected.id);

  return (
    <div className="field-group crop-select">
      {crops.length > 12 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault(); // searching must not submit the form around it
          }}
          placeholder={biInline('cropSearchPlaceholder')}
          aria-label={biInline('cropSearchPlaceholder')}
        />
      )}
      <select
        name={name}
        value={current}
        aria-label={ariaLabel}
        onChange={(e) => {
          setInner(e.target.value);
          onChange?.(e.target.value);
        }}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {keepSelected && <option value={selected.id}>{cropLabel(selected)}</option>}
        {flatGroups(buildGroups(shown, categories)).map((g) => (
          <optgroup key={g.key} label={g.label}>
            {g.crops.map((c) => (
              <option key={c.id} value={c.id}>
                {cropLabel(c)}
              </option>
            ))}
          </optgroup>
        ))}
        {extraOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
