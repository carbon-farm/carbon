import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listPendingVendors, verifyVendor, type VendorProfile } from '../api/marketplace';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function VendorApprovalsPage() {
  const { session, logout } = useAuth();
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
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
    listPendingVendors(session.accessToken)
      .then(setVendors)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadVendors.en} / ${strings.couldNotLoadVendors.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleApprove(id: string) {
    if (!session) return;
    setBusyId(id);
    setError(null);
    try {
      await verifyVendor(session.accessToken, id, true);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotVerifyVendor.en} / ${strings.couldNotVerifyVendor.te}`);
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
      await verifyVendor(session.accessToken, id, false, reason);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotVerifyVendor.en} / ${strings.couldNotVerifyVendor.te}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="vendorApprovalsTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : vendors.length === 0 ? (
        <BiValue value={strings.noVendorsPending} as="p" className="hint" />
      ) : (
        <div className="card">
          {vendors.map((v) => {
            const isBusy = busyId === v.id;
            return (
              <div className="farm-item" key={v.id}>
                <div className="label">{v.businessName}</div>
                <div className="meta">{v.user?.name} · {v.user?.mobileNumber}</div>
                {v.description && <div className="hint">{v.description}</div>}
                <button type="button" onClick={() => handleApprove(v.id)} disabled={isBusy}>
                  {isBusy ? <BiValue value={strings.approving} /> : <Bi id="approveVendorButton" />}
                </button>
                <label>
                  <Bi id="rejectReasonField" />
                  <input
                    value={rejectReason[v.id] ?? ''}
                    onChange={(e) => {
                      setRejectReason((prev) => ({ ...prev, [v.id]: e.target.value }));
                      clearCustomValidity(e);
                    }}
                    onInvalid={bilingualInvalidHandler}
                  />
                </label>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => handleReject(v.id)}
                  disabled={isBusy || !rejectReason[v.id]?.trim()}
                >
                  {isBusy ? <BiValue value={strings.rejecting} /> : <Bi id="rejectVendorButton" />}
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
