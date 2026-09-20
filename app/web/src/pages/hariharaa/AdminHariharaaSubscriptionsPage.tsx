import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { listPendingPayments, reviewPayment, type PendingPayment } from '../../api/hariharaa';
import { Bi, BiValue, biInline } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { periodText } from '../../membership/plans';
import { bilingualInvalidHandler, clearCustomValidity } from '../../i18n/validation';

type SortMode = 'oldest' | 'newest' | 'amount';

// Payments customers say they've made, waiting for an Administrator to check the bank
// credit. The same list is what a gateway would eventually clear on its own.
export function AdminHariharaaSubscriptionsPage() {
  const { session, logout } = useAuth();
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('oldest');

  useEffect(() => {
    if (!session) return;
    listPendingPayments(session.accessToken)
      .then(setPayments)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadHariharaaSubscriptions.en} / ${strings.couldNotLoadHariharaaSubscriptions.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = payments;
    if (q) {
      rows = rows.filter((p) =>
        [p.user.userCode, p.user.name, p.user.mobileNumber, p.utr].some((v) => v?.toLowerCase().includes(q)),
      );
    }
    rows = [...rows];
    if (sortMode === 'amount') rows.sort((a, b) => b.amountInr - a.amountInr);
    else rows.sort((a, b) => (a.claimedAt ?? '').localeCompare(b.claimedAt ?? '') * (sortMode === 'newest' ? -1 : 1));
    return rows;
  }, [payments, search, sortMode]);

  async function decide(id: string, approve: boolean) {
    if (!session) return;
    const reason = rejectReason[id]?.trim();
    if (!approve && !reason) return;
    setBusyId(id);
    setError(null);
    try {
      await reviewPayment(session.accessToken, id, approve, approve ? undefined : reason);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotReviewHariharaaSubscription.en} / ${strings.couldNotReviewHariharaaSubscription.te}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="hariharaaSubscriptionsAdminTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && payments.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="amount">{biInline('productPriceLabel')} ↓</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : payments.length === 0 ? (
        <BiValue value={strings.noHariharaaSubscriptionsPending} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.reportNoData} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((p) => {
            const isBusy = busyId === p.id;
            return (
              <div className="farm-item" key={p.id}>
                <div className="label">
                  {p.user.userCode} · {p.user.name}
                </div>
                <div className="meta">{p.user.mobileNumber}</div>
                <div>
                  <div className="field-label">
                    <Bi id="hariharaaPaymentReferenceLabel" />
                  </div>
                  <div>{p.utr}</div>
                </div>
                <div>
                  <div className="field-label">
                    <Bi id="hariharaaExpectedAmountLabel" />
                  </div>
                  <div>
                    ₹{p.amountInr.toFixed(2)}
                    {p.planName ? ` · ${p.planName}` : ''} · {periodText(p.periodDays)}
                  </div>
                </div>
                {p.claimedAt && <div className="meta">{new Date(p.claimedAt).toLocaleString()}</div>}
                {p.note && <div className="hint">{p.note}</div>}
                <button type="button" onClick={() => decide(p.id, true)} disabled={isBusy}>
                  {isBusy ? <BiValue value={strings.approving} /> : <Bi id="approveButton" />}
                </button>
                <label>
                  <Bi id="rejectReasonField" />
                  <input
                    value={rejectReason[p.id] ?? ''}
                    onChange={(e) => {
                      setRejectReason((prev) => ({ ...prev, [p.id]: e.target.value }));
                      clearCustomValidity(e);
                    }}
                    onInvalid={bilingualInvalidHandler}
                  />
                </label>
                <button type="button" className="secondary" onClick={() => decide(p.id, false)} disabled={isBusy || !rejectReason[p.id]?.trim()}>
                  {isBusy ? <BiValue value={strings.rejecting} /> : <Bi id="rejectButton" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
