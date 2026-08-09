import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getCase, startWorkCase, requestFollowUpOnCase, answerCase, type Case } from '../api/cases';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function ExpertCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [theCase, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session || !id) return;
    loadCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  function loadCase() {
    if (!session || !id) return;
    setLoading(true);
    getCase(session.accessToken, id)
      .then(setCase)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadCase.en} / ${strings.couldNotLoadCase.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleStartWork() {
    if (!session || !theCase) return;
    setBusy(true);
    setError(null);
    try {
      setCase(await startWorkCase(session.accessToken, theCase.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotStartWork.en} / ${strings.couldNotStartWork.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleAskQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !theCase) return;
    const question = String(new FormData(event.currentTarget).get('question') ?? '');
    setBusy(true);
    setError(null);
    try {
      setCase(await requestFollowUpOnCase(session.accessToken, theCase.id, question));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSendQuestion.en} / ${strings.couldNotSendQuestion.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !theCase) return;
    const resolutionNotes = String(new FormData(event.currentTarget).get('resolutionNotes') ?? '');
    setBusy(true);
    setError(null);
    try {
      setCase(await answerCase(session.accessToken, theCase.id, resolutionNotes));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAnswer.en} / ${strings.couldNotAnswer.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <div>
        <Bi id="caseDetailEyebrow" as="span" className="eyebrow" />
        <h1>{theCase?.caseNumber ?? theCase?.id.slice(0, 8) ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !theCase ? (
        <BiValue value={strings.caseNotFoundError} as="p" className="hint" />
      ) : (
        <>
          <div className="card">
            <div className="status-line">
              <BiValue value={caseStatusLabel(theCase.status, theCase.closureReason)} />
            </div>
            {theCase.isPriority && <BiValue value={strings.priorityBadgeLabel} as="span" className="priority-badge" />}

            <div>
              <div className="field-label"><Bi id="parcelLabel" /></div>
              <div>{theCase.farmLand.label}</div>
            </div>
            <div>
              <div className="field-label"><Bi id="categoryLabel" /></div>
              <div><BiValue value={caseCategoryLabel(theCase.category.name)} /></div>
            </div>
            <div>
              <div className="field-label"><Bi id="problemLabel" /></div>
              <div>{theCase.problemDescription}</div>
            </div>
            {theCase.evidenceNotes && (
              <div>
                <div className="field-label"><Bi id="evidenceLabel" /></div>
                <div>{theCase.evidenceNotes}</div>
              </div>
            )}
            {theCase.followUpQuestion && (
              <div>
                <div className="field-label"><Bi id="followUpQuestionLabel" /></div>
                <div>{theCase.followUpQuestion}</div>
              </div>
            )}
            {theCase.followUpResponse && (
              <div>
                <div className="field-label"><Bi id="farmerResponseLabel" /></div>
                <div>{theCase.followUpResponse}</div>
              </div>
            )}
          </div>

          {theCase.status === 'ASSIGNED' && (
            <div className="card">
              <button type="button" onClick={handleStartWork} disabled={busy}>
                {busy ? <BiValue value={strings.startingWork} /> : <Bi id="startWorkButton" />}
              </button>
            </div>
          )}

          {theCase.status === 'WAITING_FARMER' && (
            <BiValue value={strings.waitingOnFarmerNotice} as="p" className="hint" />
          )}

          {theCase.status === 'EXPERT_WORKING' && (
            <>
              <div className="card">
                <Bi id="askFollowUpHeading" as="h2" />
                <form onSubmit={handleAskQuestion}>
                  <label>
                    <Bi id="followUpQuestionField" />
                    <textarea
                      name="question"
                      onChange={clearCustomValidity}
                      onInvalid={bilingualInvalidHandler}
                      minLength={3}
                      rows={2}
                      required
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    {busy ? <BiValue value={strings.sending} /> : <Bi id="sendQuestionButton" />}
                  </button>
                </form>
              </div>

              <div className="card">
                <Bi id="answerCaseHeading" as="h2" />
                <form onSubmit={handleAnswer}>
                  <label>
                    <Bi id="resolutionNotesField" />
                    <textarea
                      name="resolutionNotes"
                      onChange={clearCustomValidity}
                      onInvalid={bilingualInvalidHandler}
                      minLength={5}
                      rows={4}
                      required
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    {busy ? <BiValue value={strings.answering} /> : <Bi id="answerCaseButton" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </>
      )}

      <Link to="/expert/cases" className="link-button">
        {strings.backToCasesLink.en} / {strings.backToCasesLink.te}
      </Link>
    </div>
  );
}
