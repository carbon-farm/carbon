import { Bi, biInline } from '../i18n/Bi';
import type { Bilingual } from '../i18n/strings';

// The search box + "Sort by" choice that every list in the app carries (see CLAUDE.md). Pages keep
// the two values in their own state and apply them to their rows.
export function ListBar({
  search,
  onSearch,
  sort,
  onSort,
  sorts,
}: {
  search: string;
  onSearch: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
  sorts: { value: string; label: Bilingual }[];
}) {
  return (
    <div className="list-toolbar">
      <label>
        <Bi id="searchPlaceholder" />
        <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
      </label>
      <label>
        <Bi id="sortByLabel" />
        <select value={sort} onChange={(e) => onSort(e.target.value)}>
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label.en} / {s.label.te}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
