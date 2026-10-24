import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getLowStock, type LowStockRow } from '../api/marketplace';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';

type SortKey = 'name' | 'stock' | 'sold' | 'suggest';

// For the administrator: what is running low or out, what it sold in the last 30 days, and a
// suggested quantity to order (enough for the next 30 days at that rate plus a quarter extra).
// A product that has not sold lately gets no suggestion rather than a guess.
export function RestockSuggestions() {
  const { session } = useAuth();
  const [rows, setRows] = useState<LowStockRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [onlySuggested, setOnlySuggested] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('stock');
  const [asc, setAsc] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getLowStock(session.accessToken)
      .then((r) => !cancelled && setRows(r))
      .catch(() => !cancelled && setRows([]));
    return () => {
      cancelled = true;
    };
  }, [session]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = (rows ?? []).filter((r) => (!q || r.name.toLowerCase().includes(q)) && (!onlySuggested || (r.suggestedReorder ?? 0) > 0));
    const val = (r: LowStockRow) => (sortKey === 'name' ? r.name.toLowerCase() : sortKey === 'stock' ? r.stockQuantity : sortKey === 'sold' ? r.soldLast30Days : r.suggestedReorder ?? -1);
    return filtered.sort((a, b) => {
      const x = val(a);
      const y = val(b);
      const c = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
      return asc ? c : -c;
    });
  }, [rows, search, onlySuggested, sortKey, asc]);

  if (rows === null || rows.length === 0) return null;

  const sortBy = (k: SortKey) => {
    if (k === sortKey) setAsc((a) => !a);
    else {
      setSortKey(k);
      setAsc(k === 'name' || k === 'stock');
    }
  };
  const arrow = (k: SortKey) => (k === sortKey ? (asc ? ' ▲' : ' ▼') : '');
  const th = (k: SortKey, label: { en: string; te: string }) => (
    <th className="sortable" onClick={() => sortBy(k)}>
      {label.en} / {label.te}
      {arrow(k)}
    </th>
  );

  return (
    <div className="card">
      <Bi id="restockTitle" as="h2" />
      <BiValue value={strings.restockHint} as="p" className="hint" />
      <div className="list-toolbar">
        <label>
          <Bi id="searchPlaceholder" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={onlySuggested} onChange={(e) => setOnlySuggested(e.target.checked)} />
          <Bi id="restockOnlySuggested" />
        </label>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {th('name', strings.restockColProduct)}
              {th('stock', strings.restockColStock)}
              {th('sold', strings.restockColSold)}
              {th('suggest', strings.restockColSuggest)}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link to={`/marketplace/manage/products/${r.id}`}>{r.name}</Link>
                </td>
                <td>
                  {r.stockQuantity} {r.unit}
                </td>
                <td>{r.soldLast30Days}</td>
                <td>
                  {r.suggestedReorder === null ? (
                    <span className="hint">{strings.restockNoSales.en} / {strings.restockNoSales.te}</span>
                  ) : r.suggestedReorder === 0 ? (
                    <span className="hint">{strings.restockEnough.en} / {strings.restockEnough.te}</span>
                  ) : (
                    <strong>{r.suggestedReorder}</strong>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
