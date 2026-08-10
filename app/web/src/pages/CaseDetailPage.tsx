import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { getCase, submitCase, respondToFollowUp, confirmCase, disputeCase, uploadCaseEvidence, type Case } from '../api/cases';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel, caseStatusLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
function isImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const [theCase, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleSubmit() {
    if (!session || !theCase) return;
    setBusy(true);
    setError(null);
    try {
      setCase(await submitCase(session.accessToken, theCase.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitCase.en} / ${strings.couldNotSubmitCase.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRespond(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !theCase) return;
    const answer = String(new FormData(event.currentTarget).get('answer') ?? '');
    setBusy(true);
    setError(null);
    try {
      setCase(await respondToFollowUp(session.accessToken, theCase.id, answer));
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotRespond.en} / ${strings.couldNotRespond.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    if (!session || !theCase) return;
    setBusy(true);
    setError(null);
    try {
      setCase(await confirmCase(session.accessToken, theCase.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotConfirm.en} / ${strings.couldNotConfirm.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDispute() {
    if (!session || !theCase) return;
    setBusy(true);
    setError(null);
    try {
      setCase(await disputeCase(session.accessToken, theCase.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotDispute.en} / ${strings.couldNotDispute.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!session || !theCase || !file) return;
    setUploading(true);
    setError(null);
    try {
      setCase(await uploadCaseEvidence(session.accessToken, theCase.id, file));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUploadEvidence.en} / ${strings.couldNotUploadEvidence.te}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="screen">
      <div>
        <Bi id="caseDetailEyebrow" as="span" className="eyebrow" />
        <h1>{theCase?.caseNumber ?? <BiValue value={strings.statusDraft} />}</h1>
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

            {theCase.evidenceMediaUrls.length > 0 && (
              <div>
                <div className="field-label"><Bi id="evidenceMediaLabel" /></div>
                <div className="evidence-media-grid">
                  {theCase.evidenceMediaUrls.map((url) =>
                    isImageUrl(url) ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
                        <img src={url} alt="" className="evidence-thumb" />
                      </a>
                    ) : (
                      <a href={url} target="_blank" rel="noopener noreferrer" key={url} className="link-button">
                        {strings.watchVideoLink.en} / {strings.watchVideoLink.te}
                      </a>
                    ),
                  )}
                </div>
              </div>
            )}

            {theCase.status !== 'CLOSED' && (
              <label>
                <Bi id="addEvidenceButton" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={handleFileSelected}
                  disabled={uploading}
                />
                {uploading && <BiValue value={strings.uploading} as="p" className="hint" />}
              </label>
            )}
          </div>

          {theCase.status === 'DRAFT' && (
            <div className="card">
              <BiValue value={strings.draftBadgeNotice} as="p" className="hint" />
              <button type="button" onClick={handleSubmit} disabled={busy}>
                {busy ? <BiValue value={strings.submitting} /> : <Bi id="submitCaseButton" />}
              </button>
            </div>
          )}

          {theCase.status === 'WAITING_FARMER' && theCase.followUpQuestion && (
            <div className="card">
              <div className="field-label"><Bi id="followUpQuestionLabel" /></div>
              <div>{theCase.followUpQuestion}</div>
              <form onSubmit={handleRespond}>
                <label>
                  <Bi id="yourResponseField" />
                  <textarea
                    name="answer"
                    onChange={clearCustomValidity}
                    onInvalid={bilingualInvalidHandler}
                    rows={3}
                    required
                  />
                </label>
                <button type="submit" disabled={busy}>
                  {busy ? <BiValue value={strings.sending} /> : <Bi id="sendResponseButton" />}
                </button>
              </form>
            </div>
          )}

          {theCase.status === 'ANSWERED' && theCase.resolutionNotes && (
            <div className="card">
              <div className="field-label"><Bi id="resolutionLabel" /></div>
              <div>{theCase.resolutionNotes}</div>
              <button type="button" onClick={handleConfirm} disabled={busy}>
                {busy ? <BiValue value={strings.confirming} /> : <Bi id="confirmResolutionButton" />}
              </button>
              <button type="button" className="secondary" onClick={handleDispute} disabled={busy}>
                {busy ? <BiValue value={strings.disputing} /> : <Bi id="disputeResolutionButton" />}
              </button>
            </div>
          )}
        </>
      )}

      <Link to="/cases" className="link-button">
        {strings.backToCasesLink.en} / {strings.backToCasesLink.te}
      </Link>
    </div>
  );
}
