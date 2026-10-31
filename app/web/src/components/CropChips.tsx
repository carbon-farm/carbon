import { useState } from 'react';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import type { Crop } from '../api/configuration';
import { buildGroups, countCrops, cropLabel, matchesCrop, type GroupNode } from '../lib/crops';
import { useCropCategories } from '../lib/useCropCategories';

const MAX_SEARCH_CHIPS = 40;
// Below this many crops there is no need for groups or search: just show them all.
const SHORT_LIST = 12;

// Pick the crops a parcel grows by tapping chips, and add any other crop by typing its name — no
// commas to remember. With a long master list the chips sit in collapsed groups (a main group holds
// its sub-groups), and a search box finds a crop by its English or Telugu name. The chosen crops
// are returned as plain English names (what the parcel stores), so a crop that is not in the master
// list is kept exactly as typed.
export function CropChips({ crops, value, onChange }: { crops: Crop[]; value: string[]; onChange: (next: string[]) => void }) {
  const { categories } = useCropCategories();
  const [other, setOther] = useState('');
  const [query, setQuery] = useState('');
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const has = (name: string) => value.some((v) => same(v, name));
  const toggle = (name: string) => onChange(has(name) ? value.filter((v) => !same(v, name)) : [...value, name]);

  const chosenLabel = (name: string) => {
    const known = crops.find((c) => same(c.name, name));
    return known ? cropLabel(known) : name;
  };
  const chip = (name: string, label: string) => (
    <button key={name} type="button" className={has(name) ? 'chip-on' : 'secondary'} aria-pressed={has(name)} onClick={() => toggle(name)}>
      {label}
    </button>
  );
  const chips = (list: Crop[]) => list.filter((c) => !has(c.name)).map((c) => chip(c.name, cropLabel(c)));

  const long = crops.length > SHORT_LIST;
  const q = query.trim();
  const matches = q ? crops.filter((c) => matchesCrop(c, q, categories) && !has(c.name)) : [];

  function addOther() {
    const name = other.trim();
    if (!name) return;
    if (!has(name)) onChange([...value, name]);
    setOther('');
  }

  const group = (node: GroupNode, nested: boolean) => (
    <details key={node.key} className={nested ? 'crop-group nested' : 'crop-group'}>
      <summary>
        {node.title} ({countCrops(node, (c) => !has(c.name))})
      </summary>
      {node.crops.length > 0 && <div className="chip-row">{chips(node.crops)}</div>}
      {node.children.map((child) => group(child, true))}
    </details>
  );

  return (
    <div className="field-group">
      {value.length > 0 && (
        <div role="group" aria-label={biInline('cropChosenHeading')}>
          <Bi id="cropChosenHeading" as="small" className="hint" />
          <div className="chip-row">{value.map((name) => chip(name, chosenLabel(name)))}</div>
        </div>
      )}

      {!long && (
        <div className="chip-row" role="group" aria-label={biInline('cropsPickLabel')}>
          {chips(crops)}
        </div>
      )}

      {long && (
        <>
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
          {q ? (
            <div className="chip-row" role="group" aria-label={biInline('cropsPickLabel')}>
              {matches.slice(0, MAX_SEARCH_CHIPS).map((c) => chip(c.name, cropLabel(c)))}
              {matches.length === 0 && <BiValue value={strings.cropNoMatch} as="small" className="hint" />}
              {matches.length > MAX_SEARCH_CHIPS && (
                <BiValue
                  value={{
                    en: strings.cropMoreMatches.en.replace('{n}', String(MAX_SEARCH_CHIPS)),
                    te: strings.cropMoreMatches.te.replace('{n}', String(MAX_SEARCH_CHIPS)),
                  }}
                  as="small"
                  className="hint"
                />
              )}
            </div>
          ) : (
            <div className="crop-groups" role="group" aria-label={biInline('cropsPickLabel')}>
              {buildGroups(crops, categories).map((node) => group(node, false))}
            </div>
          )}
        </>
      )}

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
