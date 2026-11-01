import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getBoardLinkKey, rotateBoardLinkKey } from '../api/testerBoard';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// Admin home: the address of the testers' board (a page that needs no sign-in). The secret in it
// is what keeps strangers out, so it can be replaced here — the old address then stops working.
export function TesterBoardLinkCard() {
  const { session } = useAuth();
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    getBoardLinkKey(session.accessToken)
      .then((r) => setKey(r.key))
      .catch((err) => setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`));
  }, [session]);

  const url = key ? `${window.location.origin}/testers/${key}` : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the link is shown, so it can still be selected by hand */
    }
  }

  async function rotate() {
    if (!session || !window.confirm(`${strings.tbRotateConfirm.en} / ${strings.tbRotateConfirm.te}`)) return;
    setBusy(true);
    setError(null);
    try {
      setKey((await rotateBoardLinkKey(session.accessToken)).key);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <BiValue value={strings.tbAdminTitle} as="h2" />
      <BiValue value={strings.tbAdminDesc} as="p" className="hint" />
      {error && <div className="error-banner">{error}</div>}
      {url && (
        <>
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label={`${strings.tbAdminTitle.en} / ${strings.tbAdminTitle.te}`} />
          <div className="button-row">
            <button type="button" onClick={copy}>
              {copied ? <Bi id="tbCopied" /> : <Bi id="tbCopy" />}
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="link-button">
              <Bi id="tbOpenItem" />
            </a>
            <button type="button" className="secondary" onClick={rotate} disabled={busy}>
              <Bi id="tbRotate" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
