import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listMyStockWatches, toggleStockWatch } from '../api/marketplace';
import { Bi } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// On an out-of-stock product: "Tell me when it is back". One tap on, one tap off; the member gets
// a notification (the bell) the moment stock returns, and the request is then cleared.
export function StockWatchButton({ productId }: { productId: string }) {
  const { session } = useAuth();
  const [watching, setWatching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    listMyStockWatches(session.accessToken)
      .then((ids) => !cancelled && setWatching(ids.includes(productId)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session, productId]);

  async function toggle() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      setWatching((await toggleStockWatch(session.accessToken, productId)).watching);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={watching ? 'secondary' : ''} onClick={toggle} disabled={busy} aria-pressed={watching}>
        {watching ? <Bi id="stockWatchOn" /> : <Bi id="stockWatchOff" />}
      </button>
      {error && <div className="error-banner">{error}</div>}
    </>
  );
}
