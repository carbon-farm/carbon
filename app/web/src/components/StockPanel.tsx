import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { adjustStock, listStockMovements, type StockMode, type StockMovement, type StockMovementType } from '../api/marketplace';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';

const TYPE_KEYS: Record<StockMovementType, StringKey> = {
  INITIAL: 'stockTypeInitial',
  SALE: 'stockTypeSale',
  CANCEL_RESTOCK: 'stockTypeCancel',
  ADD: 'stockTypeAdd',
  REDUCE: 'stockTypeReduce',
  SET: 'stockTypeSet',
};

type SortKey = 'createdAt' | 'type' | 'quantityChange' | 'balanceAfter' | 'actorName';
type SortDir = 'asc' | 'desc';

// Stock in hand for a product, with the three ways to change it — add (received), reduce
// (damaged, expired, given away) and set to a counted figure — and the full history of every
// change. Sales and cancelled orders show up in the history on their own.
export function StockPanel({ productId, onStockChanged }: { productId: string; onStockChanged?: (stock: number) => void }) {
  const { session, logout } = useAuth();
  const [stock, setStock] = useState<number | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [mode, setMode] = useState<StockMode>('ADD');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const r = await listStockMovements(session.accessToken, productId);
      setStock(r.stockQuantity);
      setMovements(r.movements);
      onStockChanged?.(r.stockQuantity);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadStockHistory.en} / ${strings.couldNotLoadStockHistory.te}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, productId, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const form = event.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const r = await adjustStock(session.accessToken, productId, {
        mode,
        quantity: Number(f.get('quantity')),
        reason: String(f.get('reason') ?? '').trim() || undefined,
      });
      setNotice(
        r.change === 0
          ? `${strings.stockNoChangeNotice.en} / ${strings.stockNoChangeNotice.te}`
          : `${strings.stockUpdatedNotice.en.replace('{n}', String(r.stockQuantity))} / ${strings.stockUpdatedNotice.te.replace('{n}', String(r.stockQuantity))}`,
      );
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUpdateStock.en} / ${strings.couldNotUpdateStock.te}`);
    } finally {
      setBusy(false);
    }
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'createdAt' || key === 'quantityChange' || key === 'balanceAfter' ? 'desc' : 'asc');
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = movements.filter(
      (m) => (!typeFilter || m.type === typeFilter) && (!q || [m.reason ?? '', m.actorName ?? ''].some((v) => v.toLowerCase().includes(q))),
    );
    const cmp = (a: StockMovement, b: StockMovement) => {
      switch (sortKey) {
        case 'type':
          return a.type.localeCompare(b.type);
        case 'actorName':
          return (a.actorName ?? '').localeCompare(b.actorName ?? '');
        case 'quantityChange':
          return a.quantityChange - b.quantityChange;
        case 'balanceAfter':
          return a.balanceAfter - b.balanceAfter;
        default:
          return a.createdAt.localeCompare(b.createdAt);
      }
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [movements, typeFilter, search, sortKey, sortDir]);

  const th = (key: SortKey, label: { en: string; te: string }) => (
    <th className="sortable" onClick={() => handleSort(key)}>
      {label.en} / {label.te}
      {key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

  return (
    <div className="card">
      <Bi id="stockPanelHeading" as="h2" />
      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{stock ?? '…'}</div>
          <BiValue value={strings.stockInHandLabel} as="div" className="label" />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {notice && <div className="success-banner">{notice}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            <Bi id="stockModeField" />
            <select value={mode} onChange={(e) => setMode(e.target.value as StockMode)}>
              <option value="ADD">{biInline('stockModeAdd')}</option>
              <option value="REDUCE">{biInline('stockModeReduce')}</option>
              <option value="SET">{biInline('stockModeSet')}</option>
            </select>
          </label>
          <label>
            <Bi id={mode === 'SET' ? 'stockCountedField' : 'stockQuantityField'} />
            <input name="quantity" type="number" step="1" min={mode === 'SET' ? 0 : 1} max={1000000} required />
          </label>
          <label className="span-2">
            <Bi id="stockReasonField" />
            <input name="reason" maxLength={200} minLength={mode === 'ADD' ? 0 : 3} required={mode !== 'ADD'} placeholder={mode === 'ADD' ? biInline('stockReasonAddExample') : biInline('stockReasonReduceExample')} />
          </label>
        </div>
        <BiValue value={strings.stockPanelHint} as="p" className="hint" />
        <div className="form-actions">
          <button type="submit" disabled={busy}>
            {busy ? <BiValue value={strings.saving} /> : <Bi id="stockUpdateButton" />}
          </button>
        </div>
      </form>

      <Bi id="stockHistoryHeading" as="h2" />
      {movements.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          <label>
            <Bi id="stockColType" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {(Object.keys(TYPE_KEYS) as StockMovementType[]).map((t) => (
                <option key={t} value={t}>
                  {strings[TYPE_KEYS[t]].en} / {strings[TYPE_KEYS[t]].te}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {movements.length === 0 ? (
        <BiValue value={strings.stockNoHistory} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {th('createdAt', strings.dateColumnLabel)}
                {th('type', strings.stockColType)}
                {th('quantityChange', strings.stockColChange)}
                {th('balanceAfter', strings.stockColBalance)}
                {th('actorName', strings.stockColBy)}
                <th>
                  {strings.stockColNote.en} / {strings.stockColNote.te}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>
                    {strings[TYPE_KEYS[m.type]].en} / {strings[TYPE_KEYS[m.type]].te}
                  </td>
                  <td>
                    <strong>{m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}</strong>
                  </td>
                  <td>{m.balanceAfter}</td>
                  <td>{m.actorName ?? '—'}</td>
                  <td>{m.reason ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
