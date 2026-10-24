import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createSample, listMySamples, type SoilSample } from '../api/soilLab';
import { listFarms, type FarmLand } from '../api/farms';
import { listMyCases, type Case } from '../api/cases';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, sampleStatusLabel } from '../i18n/strings';

export function SoilSamplesPage() {
  const { session, logout } = useAuth();
  // ?parcel=<id> comes from "Request soil test" on a parcel: open the form with it chosen.
  const [searchParams] = useSearchParams();
  const presetParcel = searchParams.get('parcel') ?? '';
  const [statusFilter, setStatusFilter] = useState('');
  const [parcelFilter, setParcelFilter] = useState('');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest'>('newest');
  const [samples, setSamples] = useState<SoilSample[]>([]);
  const [farms, setFarms] = useState<FarmLand[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(!!presetParcel);
  const [farmLandId, setFarmLandId] = useState(presetParcel);
  const [caseId, setCaseId] = useState('');
  const [videoConfirmed, setVideoConfirmed] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!session) return;
    Promise.all([listMySamples(session.accessToken), listFarms(session.accessToken), listMyCases(session.accessToken)])
      .then(([samplesResult, farmsResult, casesResult]) => {
        setSamples(samplesResult);
        setFarms(farmsResult);
        setCases(casesResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadSamples.en} / ${strings.couldNotLoadSamples.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleCreate() {
    if (!session || !farmLandId || !videoConfirmed) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createSample(session.accessToken, {
        farmLandId,
        caseId: caseId || undefined,
        collectionVideoWatched: videoConfirmed,
      });
      setSamples((prev) => [created, ...prev]);
      setShowAddForm(false);
      setFarmLandId('');
      setCaseId('');
      setVideoConfirmed(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCreateSample.en} / ${strings.couldNotCreateSample.te}`);
    } finally {
      setCreating(false);
    }
  }

  const visible = useMemo(() => {
    let rows = samples;
    if (statusFilter) rows = rows.filter((s) => s.status === statusFilter);
    if (parcelFilter) rows = rows.filter((s) => s.farmLandId === parcelFilter);
    return [...rows].sort((a, b) => (sortMode === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
  }, [samples, statusFilter, parcelFilter, sortMode]);
  const statuses = useMemo(() => Array.from(new Set(samples.map((s) => s.status))), [samples]);

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="soilSamplesEyebrow" as="span" className="eyebrow" />
          <Bi id="soilSamplesTitle" as="h1" />
        </div>
        <button type="button" className="secondary" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? <Bi id="cancelButton" /> : <Bi id="newSampleButton" />}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showAddForm && (
        <div className="card">
          <label>
            <Bi id="parcelLabel" />
            <select value={farmLandId} onChange={(e) => setFarmLandId(e.target.value)}>
              <option value="" disabled>
                {biInline('selectPlaceholder')}
              </option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.label}
                </option>
              ))}
            </select>
          </label>
          {cases.length > 0 && (
            <label>
              <Bi id="linkToCaseField" />
              <select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                <option value="">{biInline('noneOption')}</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber ?? c.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="checkbox-label">
            <input type="checkbox" checked={videoConfirmed} onChange={(e) => setVideoConfirmed(e.target.checked)} />
            <Bi id="collectionVideoConfirmLabel" />
          </label>
          <button type="button" onClick={handleCreate} disabled={creating || !farmLandId || !videoConfirmed}>
            {creating ? <BiValue value={strings.creatingSample} /> : <Bi id="newSampleButton" />}
          </button>
        </div>
      )}

      {!loading && samples.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="statusFilterLabel" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {statuses.map((s) => {
                const label = sampleStatusLabel(s);
                return (
                  <option key={s} value={s}>
                    {label.en} / {label.te}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            <Bi id="parcelLabel" />
            <select value={parcelFilter} onChange={(e) => setParcelFilter(e.target.value)}>
              <option value="">{biInline('allOption')}</option>
              {Array.from(new Map(samples.map((s) => [s.farmLandId, s.farmLand.label])).entries()).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Bi id="sortByLabel" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as 'newest' | 'oldest')}>
              <option value="newest">{biInline('sortNewestFirst')}</option>
              <option value="oldest">{biInline('sortOldestFirst')}</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : samples.length === 0 ? (
        <BiValue value={strings.noSamplesYet} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.noSamplesMatch} as="p" className="hint" />
      ) : (
        <div className="card">
          {visible.map((s) => {
            const status = sampleStatusLabel(s.status);
            return (
              <Link to={`/soil-samples/${s.id}`} key={s.id} className="case-item">
                <div className="label">{s.sampleCode}</div>
                <div className="meta">{s.farmLand.label}</div>
                <div className="status-line">
                  {status.en} / {status.te}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
