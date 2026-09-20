import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { claimPayment, getMySubscription, startPayment, type MySubscription, type StartedPayment } from '../../api/hariharaa';
import { Bi, BiValue } from '../../i18n/Bi';
import { strings, hariharaaSubscriptionStatusLabel } from '../../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../../i18n/validation';
import { TestimonialsGrid } from './TestimonialsGrid';
import { UpiPaymentCard } from './UpiPaymentCard';

// The customer's Pay page. Flow: see status -> "Pay now" (creates the payment, shows the
// QR) -> pay in any UPI app -> type the UTR -> "waiting for verification" -> an
// Administrator verifies it against the bank -> the shop unlocks. Abandoning at any
// point simply leaves them unpaid; they can come back to this page and continue.
export function HariharaaSubscriptionPage() {
  const { session, logout } = useAuth();
  const [status, setStatus] = useState<MySubscription | null>(null);
  const [payment, setPayment] = useState<StartedPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getMySubscription(session.accessToken)
      .then(setStatus)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadHariharaaSubscription.en} / ${strings.couldNotLoadHariharaaSubscription.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleStart() {
    if (!session) return;
    setStarting(true);
    setError(null);
    try {
      setPayment(await startPayment(session.accessToken));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotStartPayment.en} / ${strings.couldNotStartPayment.te}`);
    } finally {
      setStarting(false);
    }
  }

  async function handleClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !payment) return;
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const utr = String(formData.get('utr') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();

    setSubmitting(true);
    setError(null);
    try {
      await claimPayment(session.accessToken, payment.paymentId, { utr, ...(note ? { note } : {}) });
      setPayment(null);
      // Re-read so the state comes from the server, not a guess made here.
      setStatus(await getMySubscription(session.accessToken));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitHariharaaClaim.en} / ${strings.couldNotSubmitHariharaaClaim.te}`);
    } finally {
      setSubmitting(false);
    }
  }

  const state = status?.state ?? 'NOT_PAID';
  const awaiting = state === 'AWAITING_VERIFICATION';
  const isRenewal = state === 'ACTIVE' || state === 'EXPIRED' || state === 'FREE';

  return (
    <>
      <div>
        <Bi id="hariharaaSubscriptionNavTitle" as="span" className="eyebrow" />
        <Bi id="hariharaaSubscriptionTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <>
          <div className="card">
            {status?.userCode && (
              <div>
                <div className="field-label">
                  <Bi id="hariharaaYourIdLabel" />
                </div>
                <div>
                  <strong>{status.userCode}</strong>
                </div>
              </div>
            )}

            <div className="field-label">
              <Bi id="hariharaaStatusLabel" />
            </div>
            <BiValue value={hariharaaSubscriptionStatusLabel(state)} as="p" />

            {state === 'REJECTED' && status?.latestPayment?.rejectionReason && (
              <div>
                <div className="field-label">
                  <Bi id="hariharaaLastRejectionLabel" />
                </div>
                <div>{status.latestPayment.rejectionReason}</div>
              </div>
            )}

            {status?.activeUntil && (
              <div>
                <div className="field-label">
                  <Bi id={status.hasAccess ? (status.accessKind === 'FREE' ? 'hariharaaFreeUntilLabel' : 'hariharaaActiveUntilLabel') : 'hariharaaExpiredOnLabel'} />
                </div>
                <div>{new Date(status.activeUntil).toLocaleDateString()}</div>
                {status.freeNote && (
                  <div className="hint">
                    {strings.memberFreeReasonPrefix.en} {status.freeNote}
                  </div>
                )}
              </div>
            )}
          </div>

          {awaiting ? (
            <div className="card">
              <BiValue value={strings.hariharaaPayVerifyingNotice} as="p" />
            </div>
          ) : (
            <div className="card">
              <Bi id={isRenewal ? 'hariharaaRenewHeading' : 'hariharaaPayHeading'} as="h2" />

              {!payment ? (
                <button type="button" onClick={handleStart} disabled={starting}>
                  {starting ? <BiValue value={strings.hariharaaStartingPayment} /> : <Bi id="hariharaaPayNowButton" />}
                </button>
              ) : (
                <>
                  <UpiPaymentCard payment={payment} />
                  <BiValue value={strings.hariharaaPayThenSubmitHint} as="p" className="hint" />
                  {payment.userCode && <BiValue value={strings.hariharaaYourIdHint} as="p" className="hint" />}

                  <form onSubmit={handleClaim}>
                    <label>
                      <Bi id="hariharaaPaymentReferenceField" />
                      <input name="utr" required minLength={6} maxLength={40} onInvalid={bilingualInvalidHandler} onChange={clearCustomValidity} />
                    </label>
                    <label>
                      <Bi id="hariharaaNoteField" />
                      <textarea name="note" rows={2} />
                    </label>
                    <button type="submit" disabled={submitting}>
                      {submitting ? <BiValue value={strings.hariharaaSubmittingClaim} /> : <Bi id="hariharaaSubmitClaimButton" />}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {!status?.hasAccess && <TestimonialsGrid />}
        </>
      )}

      {status?.hasAccess && (
        <Link to="/marketplace" className="link-button">
          {strings.backButton.en} / {strings.backButton.te}
        </Link>
      )}
    </>
  );
}
