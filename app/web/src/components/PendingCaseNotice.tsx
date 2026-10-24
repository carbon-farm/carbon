import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { isNetworkFailure, sendCase } from '../lib/caseSend';
import { clearDraft, draftKeyFor, DRAFT_CHANGED_EVENT, loadDraft, type CaseDraft } from '../lib/draftStore';

// A strip under the title bar for a case that was written with no connection and is waiting on
// this phone. It sends the case by itself as soon as a connection is there (whichever screen the
// farmer is on), and says what happened. Hidden on the New case screen itself, which shows the
// same draft for editing.
export function PendingCaseNotice() {
  const { session } = useAuth();
  const { pathname } = useLocation();
  const [draft, setDraft] = useState<CaseDraft | null>(null);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [state, setState] = useState<'waiting' | 'sending' | 'sent' | 'failed'>('waiting');
  const [sentCaseId, setSentCaseId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const key = session?.role === 'MEMBER' ? draftKeyFor(session.accessToken) : null;

  const refresh = useCallback(() => {
    if (!key) return setDraft(null);
    loadDraft(key).then((d) => setDraft(d && d.queued ? d : null));
  }, [key]);

  useEffect(() => {
    refresh();
    window.addEventListener(DRAFT_CHANGED_EVENT, refresh);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener(DRAFT_CHANGED_EVENT, refresh);
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, [refresh]);

  const send = useCallback(async () => {
    if (!session || !key || !draft || sendingRef.current) return;
    sendingRef.current = true;
    setState('sending');
    setProblem(null);
    try {
      const result = await sendCase(session.accessToken, draft.fields, draft.photos, draft.thenSubmit);
      await clearDraft(key);
      setSentCaseId(result.caseId);
      setProblem(
        result.failedPhotos > 0
          ? `${strings.casePhotosFailed.en.replace('{n}', String(result.failedPhotos))} / ${strings.casePhotosFailed.te.replace('{n}', String(result.failedPhotos))}`
          : (result.submitError ?? null),
      );
      setState('sent');
    } catch (err) {
      if (isNetworkFailure(err)) setState('waiting'); // still no connection: stay queued
      else {
        setProblem(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
        setState('failed');
      }
    } finally {
      sendingRef.current = false;
    }
  }, [session, key, draft]);

  // The moment there is a connection and something is waiting, send it.
  useEffect(() => {
    if (draft && online && state === 'waiting') void send();
  }, [draft, online, state, send]);

  if (!key || pathname === '/cases/new') return null;
  if (state === 'sent' && sentCaseId) {
    return (
      <div className="payment-strip" role="status">
        <BiValue value={strings.caseQueuedSent} />{' '}
        <Link to={`/cases/${sentCaseId}`} className="link-button">
          <Bi id="openMyCaseLink" />
        </Link>
        {problem && <div className="hint">{problem}</div>}
      </div>
    );
  }
  if (!draft) return null;
  return (
    <div className={`payment-strip${state === 'failed' ? ' alert' : ''}`} role="status">
      {state === 'sending' ? <BiValue value={strings.caseQueuedSending} /> : <BiValue value={strings.caseQueuedWaiting} />}{' '}
      {state === 'failed' && problem && <span>{problem} </span>}
      <Link to="/cases/new" className="link-button">
        <Bi id="caseQueuedOpen" />
      </Link>
    </div>
  );
}
