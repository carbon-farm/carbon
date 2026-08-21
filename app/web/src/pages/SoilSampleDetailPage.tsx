import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  getSample,
  dispatchSample,
  markSampleReceived,
  markSampleTested,
  uploadSampleReport,
  type SoilSample,
} from '../api/soilLab';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, sampleStatusLabel } from '../i18n/strings';

export function SoilSampleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sample, setSample] = useState<SoilSample | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isStaff = session?.role === 'MODERATOR' || session?.role === 'ADMINISTRATOR';
  const backTo = isStaff ? '/soil-samples/manage' : '/soil-samples';

  useEffect(() => {
    if (!session || !id) return;
    loadSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  function loadSample() {
    if (!session || !id) return;
    setLoading(true);
    getSample(session.accessToken, id)
      .then(setSample)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadSample.en} / ${strings.couldNotLoadSample.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function handleDispatch() {
    if (!session || !sample) return;
    setBusy(true);
    setError(null);
    try {
      setSample(await dispatchSample(session.accessToken, sample.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAdvanceSample.en} / ${strings.couldNotAdvanceSample.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleReceive() {
    if (!session || !sample) return;
    setBusy(true);
    setError(null);
    try {
      setSample(await markSampleReceived(session.accessToken, sample.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAdvanceSample.en} / ${strings.couldNotAdvanceSample.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleTest() {
    if (!session || !sample) return;
    setBusy(true);
    setError(null);
    try {
      setSample(await markSampleTested(session.accessToken, sample.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAdvanceSample.en} / ${strings.couldNotAdvanceSample.te}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleUploadReport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!session || !sample || !file) return;
    setBusy(true);
    setError(null);
    try {
      setSample(await uploadSampleReport(session.accessToken, sample.id, file));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotUploadReport.en} / ${strings.couldNotUploadReport.te}`);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <>
      <div>
        <Bi id="soilSamplesEyebrow" as="span" className="eyebrow" />
        <h1>{sample?.sampleCode ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !sample ? (
        <BiValue value={strings.sampleNotFoundError} as="p" className="hint" />
      ) : (
        <div className="card">
          <div className="status-line">
            {sampleStatusLabel(sample.status).en} / {sampleStatusLabel(sample.status).te}
          </div>
          <div>
            <div className="field-label"><Bi id="parcelLabel" /></div>
            <div>{sample.farmLand.label}</div>
          </div>
          {sample.case && (
            <div>
              <div className="field-label"><Bi id="linkToCaseField" /></div>
              <div>{sample.case.caseNumber}</div>
            </div>
          )}
          {isStaff && sample.farmer && (
            <div>
              <div className="field-label"><Bi id="actorColumnLabel" /></div>
              <div>{sample.farmer.name} · {sample.farmer.mobileNumber}</div>
            </div>
          )}

          {sample.status === 'REPORT_AVAILABLE' && sample.reportUrl && (
            <a href={sample.reportUrl} target="_blank" rel="noopener noreferrer" className="link-button">
              {strings.viewReportLink.en} / {strings.viewReportLink.te}
            </a>
          )}

          {isStaff && sample.status === 'CREATED' && (
            <button type="button" onClick={handleDispatch} disabled={busy}>
              {busy ? <BiValue value={strings.dispatchingSample} /> : <Bi id="dispatchButton" />}
            </button>
          )}
          {isStaff && sample.status === 'DISPATCHED' && (
            <button type="button" onClick={handleReceive} disabled={busy}>
              {busy ? <BiValue value={strings.dispatchingSample} /> : <Bi id="markReceivedButton" />}
            </button>
          )}
          {isStaff && sample.status === 'RECEIVED' && (
            <button type="button" onClick={handleTest} disabled={busy}>
              {busy ? <BiValue value={strings.dispatchingSample} /> : <Bi id="markTestedButton" />}
            </button>
          )}
          {isStaff && sample.status === 'TESTED' && (
            <label>
              <Bi id="uploadReportButton" />
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleUploadReport} disabled={busy} />
              {busy && <BiValue value={strings.uploadingReport} as="p" className="hint" />}
            </label>
          )}
        </div>
      )}

      <Link to={backTo} className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
