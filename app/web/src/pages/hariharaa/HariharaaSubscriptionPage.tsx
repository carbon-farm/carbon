import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { getMySubscription, submitClaim, type Subscription } from '../../api/hariharaa';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings, hariharaaSubscriptionStatusLabel } from '../../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../../i18n/validation';

export function HariharaaSubscriptionPage() {
  const { session, logout } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getMySubscription(session.accessToken)
      .then(setSubscription)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadHariharaaSubscription.en} / ${strings.couldNotLoadHariharaaSubscription.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const paymentReference = String(formData.get('paymentReference') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();

    setSubmitting(true);
    setError(null);
    try {
      const updated = await submitClaim(session.accessToken, { paymentReference, ...(note ? { note } : {}) });
      setSubscription(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitHariharaaClaim.en} / ${strings.couldNotSubmitHariharaaClaim.te}`);
    } finally {
      setSubmitting(false);
    }
  }

  const status = subscription?.status ?? 'NOT_SUBMITTED';
  const canSubmit = status !== 'ACTIVE' && status !== 'PENDING_REVIEW';
  const statusLabel = hariharaaSubscriptionStatusLabel(status);

  return (
    <>
      <div>
        <Bi id="hariharaaShopNavTitle" as="span" className="eyebrow" />
        <Bi id="hariharaaSubscriptionTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <div className="card">
          <div className="field-label">
            <Bi id="hariharaaStatusLabel" />
          </div>
          <BiValue value={statusLabel} as="p" />

          {subscription?.activeUntil && (
            <div>
              <div className="field-label">
                <Bi id="hariharaaActiveUntilLabel" />
              </div>
              <div>{new Date(subscription.activeUntil).toLocaleDateString()}</div>
            </div>
          )}

          {canSubmit && (
            <form onSubmit={handleSubmit}>
              <label>
                <Bi id="hariharaaPaymentReferenceField" />
                <input name="paymentReference" required minLength={2} onInvalid={bilingualInvalidHandler} onChange={clearCustomValidity} />
              </label>
              <label>
                <Bi id="hariharaaNoteField" />
                <textarea name="note" rows={2} />
              </label>
              <button type="submit" disabled={submitting}>
                {submitting ? (
                  <BiValue value={strings.hariharaaSubmittingClaim} />
                ) : status === 'REJECTED' || status === 'EXPIRED' ? (
                  <Bi id="hariharaaResubmitClaimButton" />
                ) : (
                  <Bi id="hariharaaSubmitClaimButton" />
                )}
              </button>
            </form>
          )}
        </div>
      )}

      <Link to="/hariharaa/shop" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
