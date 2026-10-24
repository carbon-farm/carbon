import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getCaseHistory, type CaseEvent } from '../api/cases';
import { Bi } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';

const LABEL: Record<CaseEvent['kind'], StringKey> = {
  SUBMITTED: 'historySubmitted',
  ASSIGNED: 'historyAssigned',
  FOLLOW_UP_ASKED: 'historyFollowUpAsked',
  FOLLOW_UP_ANSWERED: 'historyFollowUpAnswered',
  ANSWERED: 'historyAnswered',
  DISPUTED: 'historyDisputed',
  CONFIRMED: 'historyConfirmed',
};

// The whole conversation on a case, oldest first: what was reported, every question and reply,
// every answer the expert gave (including ones the farmer later disputed), and how it ended. The
// case itself only keeps the latest answer; without this an expert who is asked to look again
// cannot see what they advised the first time.
export function CaseHistory({ caseId, version }: { caseId: string; version?: string }) {
  const { session } = useAuth();
  const [events, setEvents] = useState<CaseEvent[] | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getCaseHistory(session.accessToken, caseId)
      .then((e) => !cancelled && setEvents(e))
      .catch(() => !cancelled && setEvents([]));
    return () => {
      cancelled = true;
    };
  }, [session, caseId, version]);

  if (!events || events.length === 0) return null;
  return (
    <div className="card case-history">
      <Bi id="historyHeading" as="h2" />
      <ol className="timeline">
        {events.map((e, i) => (
          <li key={e.id} className={`timeline-item kind-${e.kind.toLowerCase()}`}>
            {(i === 0 ? e.caseId !== caseId : e.caseId !== events[i - 1].caseId) && (
              <div className="timeline-case">
                <small className="hint">
                  <Bi id={e.caseId === caseId ? 'historyThisCase' : 'historyEarlierCase'} /> {e.caseNumber ?? ''}
                </small>
              </div>
            )}
            <div className="timeline-head">
              <strong>
                <span className="bi-en">{strings[LABEL[e.kind]].en}</span>
                <span className="bi-te">{strings[LABEL[e.kind]].te}</span>
              </strong>
              <small className="hint">
                {e.actorName ? `${e.actorName} · ` : ''}
                {new Date(e.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </small>
            </div>
            {e.text && <p className="timeline-text">{e.text}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
