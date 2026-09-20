import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { listPendingClaims, reviewClaim, type PendingSubscriptionClaim } from '../../api/hariharaa';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings } from '../../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../../i18n/validation';

export function AdminHariharaaSubscriptionsPage() {
  const { session, logout } = useAuth();
  const [claims, setClaims] = useState<PendingSubscriptionClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!session) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function load() {
    if (!session) return;
    setLoading(true);
    listPendingClaims(session.accessToken)
      .then(setClaims)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadHariharaaSubscriptions.en} / ${strings.couldNotLoadHariharaaSubscriptions.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleApprove(id: string) {
    if (!session) return;
    setBusyId(id);
    setError(null);
    try {
      await reviewClaim(session.accessToken, id, true);
      setClaims((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotReviewHariharaaSubscription.en} / ${strings.couldNotReviewHariharaaSubscription.te}`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    if (!session) return;
    const reason = rejectReason[id]?.trim();
    if (!reason) return;
    setBusyId(id);
    setError(null);
    try {
      await reviewClaim(session.accessToken, id, false, reason);
      setClaims((prev) => prev.filter((c) => c.id !== id));
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

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : claims.length === 0 ? (
        <BiValue value={strings.noHariharaaSubscriptionsPending} as="p" className="hint" />
      ) : (
        <div className="card">
          {claims.map((c) => {
            const isBusy = busyId === c.id;
            return (
              <div className="farm-item" key={c.id}>
                <div className="label">{c.user.name}</div>
                <div className="meta">{c.user.mobileNumber}</div>
                <div>
                  <div className="field-label">
                    <Bi id="hariharaaPaymentReferenceLabel" />
                  </div>
                  <div>{c.paymentReference}</div>
                </div>
                {c.expectedAmountInr != null && (
                  <div>
                    <div className="field-label">
                      <Bi id="hariharaaExpectedAmountLabel" />
                    </div>
                    <div>₹{c.expectedAmountInr.toFixed(2)}</div>
                  </div>
                )}
                {c.note && <div className="hint">{c.note}</div>}
                <button type="button" onClick={() => handleApprove(c.id)} disabled={isBusy}>
                  {isBusy ? <BiValue value={strings.approving} /> : <Bi id="approveButton" />}
                </button>
                <label>
                  <Bi id="rejectReasonField" />
                  <input
                    value={rejectReason[c.id] ?? ''}
                    onChange={(e) => {
                      setRejectReason((prev) => ({ ...prev, [c.id]: e.target.value }));
                      clearCustomValidity(e);
                    }}
                    onInvalid={bilingualInvalidHandler}
                  />
                </label>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => handleReject(c.id)}
                  disabled={isBusy || !rejectReason[c.id]?.trim()}
                >
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
