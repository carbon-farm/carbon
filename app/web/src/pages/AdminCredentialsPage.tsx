import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listPendingCredentials, verifyCredential, type PendingCredential } from '../api/admin';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function AdminCredentialsPage() {
  const { session, logout } = useAuth();
  const [pending, setPending] = useState<PendingCredential[]>([]);
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
    listPendingCredentials(session.accessToken)
      .then(setPending)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCredentials.en} / ${strings.couldNotLoadCredentials.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleApprove(id: string) {
    if (!session) return;
    setBusyId(id);
    setError(null);
    try {
      await verifyCredential(session.accessToken, id, true);
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotVerifyCredential.en} / ${strings.couldNotVerifyCredential.te}`);
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
      await verifyCredential(session.accessToken, id, false, reason);
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotVerifyCredential.en} / ${strings.couldNotVerifyCredential.te}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <div>
          <Bi id="adminEyebrow" as="span" className="eyebrow" />
          <Bi id="credentialsPageTitle" as="h1" />
        </div>
        <button type="button" className="secondary" onClick={logout}>
          <Bi id="logoutButton" />
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : pending.length === 0 ? (
        <BiValue value={strings.noPendingCredentials} as="p" className="hint" />
      ) : (
        <div className="card">
          {pending.map((cred) => {
            const isBusy = busyId === cred.id;
            return (
              <div className="farm-item" key={cred.id}>
                <div className="label">{cred.user.name}</div>
                <div className="meta">{cred.user.mobileNumber}</div>
                <div>
                  <div className="field-label"><Bi id="qualificationLabel" /></div>
                  <div>{cred.qualification}</div>
                </div>
                {cred.licenseNumber && (
                  <div>
                    <div className="field-label"><Bi id="licenseLabel" /></div>
                    <div>{cred.licenseNumber}</div>
                  </div>
                )}
                <button type="button" onClick={() => handleApprove(cred.id)} disabled={isBusy}>
                  {isBusy ? <BiValue value={strings.approving} /> : <Bi id="approveButton" />}
                </button>
                <label>
                  <Bi id="rejectReasonField" />
                  <input
                    value={rejectReason[cred.id] ?? ''}
                    onChange={(e) => {
                      setRejectReason((prev) => ({ ...prev, [cred.id]: e.target.value }));
                      clearCustomValidity(e);
                    }}
                    onInvalid={bilingualInvalidHandler}
                  />
                </label>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => handleReject(cred.id)}
                  disabled={isBusy || !rejectReason[cred.id]?.trim()}
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
    </div>
  );
}
