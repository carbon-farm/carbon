import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { issueTemporaryPassword, type TemporaryPasswordResult } from '../api/admin';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// The Administrator's replacement for "forgot password". The person asks the store, an
// Administrator checks it really is them, then taps this: their old password stops working, they
// are signed out everywhere, and a one-time password is shown here for the Administrator to read
// out. They must choose their own at their next log in.
export function TemporaryPasswordButton({ userId, name, userCode }: { userId: string; name: string; userCode: string | null }) {
  const { session } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TemporaryPasswordResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function issue() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await issueTemporaryPassword(session.accessToken, userId));
      setConfirming(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
    } catch {
      // clipboard blocked: the password is on screen to read out instead
    }
  }

  function close() {
    setResult(null);
    setCopied(false);
    setConfirming(false);
    setError(null);
  }

  return (
    <>
      <button type="button" className="secondary" onClick={() => setConfirming(true)}>
        <Bi id="tempPasswordButton" />
      </button>

      {(confirming || result) && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={result ? undefined : close}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
            {result ? (
              <>
                <Bi id="tempPasswordIssuedTitle" as="h2" />
                <p>
                  <strong>{result.name}</strong> ({result.userCode})
                </p>
                <div className="temp-password" aria-live="polite">
                  {result.temporaryPassword}
                </div>
                <BiValue value={strings.tempPasswordShownOnce} as="p" className="hint" />
                <div className="modal-actions">
                  <button type="button" onClick={copy}>
                    {copied ? <Bi id="tempPasswordCopied" /> : <Bi id="tempPasswordCopy" />}
                  </button>
                  <button type="button" className="secondary" onClick={close}>
                    <Bi id="tempPasswordDone" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Bi id="tempPasswordConfirmTitle" as="h2" />
                <p>
                  <strong>{name}</strong> {userCode ? `(${userCode})` : ''}
                </p>
                <BiValue value={strings.tempPasswordConfirmBody} as="p" className="hint" />
                {error && <div className="error-banner">{error}</div>}
                <div className="modal-actions">
                  <button type="button" onClick={issue} disabled={busy}>
                    <Bi id="tempPasswordIssueButton" />
                  </button>
                  <button type="button" className="secondary" onClick={close} disabled={busy}>
                    <Bi id="cancelButton" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
