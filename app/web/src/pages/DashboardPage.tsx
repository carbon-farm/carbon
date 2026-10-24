import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createFarm, deleteFarm, listFarms, type FarmLand } from '../api/farms';
import { listMyCases, type Case } from '../api/cases';
import { listMySamples, type SoilSample } from '../api/soilLab';
import { listCrops } from '../api/configuration';
import { ParcelCard } from '../components/ParcelCard';
import { ListBar } from '../components/ListBar';
import { CropChips } from '../components/CropChips';
import { getAdviceForMe, type ForMeResult } from '../api/knowledge';
import { caseCategoryLabel } from '../i18n/strings';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

const PENDING_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'EXPERT_WORKING', 'WAITING_FARMER', 'ANSWERED'];

// Charter Module 2's dashboard describes a CQRS-style read model
// aggregating six-plus modules under the low-bandwidth constraint (C3) —
// at this data volume (one farmer's own records), that's over-engineering;
// these are plain queries against the same endpoints the rest of the app
// already uses. Orders/notifications/recommended-products tiles are left
// out entirely rather than faked, since Marketplace and Notification don't
// exist yet.
export function DashboardPage() {
  const { session, logout } = useAuth();
  const [farms, setFarms] = useState<FarmLand[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [parcelSearch, setParcelSearch] = useState('');
  const [parcelSort, setParcelSort] = useState('newest');
  const [samples, setSamples] = useState<SoilSample[]>([]);
  const [cropNames, setCropNames] = useState<string[]>([]);
  const [newCrops, setNewCrops] = useState<string[]>([]);
  const [advice, setAdvice] = useState<ForMeResult | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeNotice, setRemoveNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!session) return;
    // The soil tests and the crop list only decorate the parcels: if either fails the dashboard still works.
    listMySamples(session.accessToken).then(setSamples).catch(() => undefined);
    listCrops(session.accessToken).then((c) => setCropNames(c.map((x) => x.name))).catch(() => undefined);
    Promise.all([listFarms(session.accessToken), listMyCases(session.accessToken), getAdviceForMe(session.accessToken)])
      .then(([farmsResult, casesResult, adviceResult]) => {
        setFarms(farmsResult);
        setCases(casesResult);
        setAdvice(adviceResult);
      })
      .catch((err) => {
        // An expired/invalid token here isn't a "your farms failed to load"
        // problem — it's "you're not logged in anymore." Send the farmer
        // back to Login instead of stranding them on a broken dashboard.
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadFarms.en} / ${strings.couldNotLoadFarms.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  const shownFarms = useMemo(() => {
    const q = parcelSearch.trim().toLowerCase();
    const rows = farms.filter((f) => !q || [f.label, f.address, ...f.primaryCrops].some((t) => t.toLowerCase().includes(q)));
    return [...rows].sort((a, b) =>
      parcelSort === 'name' ? a.label.localeCompare(b.label) : parcelSort === 'size' ? b.landSizeAcres - a.landSizeAcres : parcelSort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
    );
  }, [farms, parcelSearch, parcelSort]);

  const askedCount = cases.filter((c) => c.status !== 'DRAFT').length;
  const pendingCount = cases.filter((c) => PENDING_STATUSES.includes(c.status)).length;
  const closedCount = cases.filter((c) => c.status === 'CLOSED').length;

  async function handleRemoveFarm(farm: FarmLand) {
    if (!session) return;
    if (!window.confirm(`${strings.parcelDeleteConfirm.en.replace('{name}', farm.label)} / ${strings.parcelDeleteConfirm.te.replace('{name}', farm.label)}`)) return;
    setRemovingId(farm.id);
    setError(null);
    setRemoveNotice(null);
    try {
      const result = await deleteFarm(session.accessToken, farm.id);
      setFarms((prev) => prev.filter((f) => f.id !== farm.id));
      // advice is matched to the crops on the remaining parcels
      setAdvice(await getAdviceForMe(session.accessToken).catch(() => advice));
      setRemoveNotice(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddFarm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const label = String(formData.get('label') ?? '');
    const address = String(formData.get('address') ?? '');
    const landSizeAcres = Number(formData.get('landSizeAcres') ?? 0);
    const primaryCrops = newCrops;
    if (primaryCrops.length === 0) {
      setError(`${strings.cropsRequired.en} / ${strings.cropsRequired.te}`);
      return;
    }

    try {
      const farm = await createFarm(session.accessToken, {
        label,
        address,
        landSizeAcres,
        primaryCrops,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
      setFarms((prev) => [farm, ...prev]);
      setShowAddForm(false);
      setCoords(null);
      setNewCrops([]);
      formEl.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddParcel.en} / ${strings.couldNotAddParcel.te}`);
    }
  }

  function handleUseLocation() {
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setError(`${strings.locationDeniedError.en} / ${strings.locationDeniedError.te}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <>
      <div>
        <Bi id="dashboardEyebrow" as="span" className="eyebrow" />
        <Bi id="yourFarms" as="h1" />
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{farms.length}</div>
          <BiValue value={strings.farmLandParcelsStat} as="div" className="label" />
        </div>
        <div className="stat-tile">
          <div className="value">{askedCount}</div>
          <BiValue value={strings.casesAskedStat} as="div" className="label" />
        </div>
        <div className="stat-tile">
          <div className="value">{pendingCount}</div>
          <BiValue value={strings.casesPendingStat} as="div" className="label" />
        </div>
        <div className="stat-tile">
          <div className="value">{closedCount}</div>
          <BiValue value={strings.casesClosedStat} as="div" className="label" />
        </div>
      </div>

      <Link to="/cases">
        <button type="button">
          <Bi id="reportProblemButton" />
        </button>
      </Link>

      <Link to="/knowledge">
        <button type="button" className="secondary">
          <Bi id="browseKnowledgeButton" />
        </button>
      </Link>

      {error && <div className="error-banner">{error}</div>}

      {advice && (advice.items.length > 0 || !advice.hasParcels) && (
        <div className="card">
          <Bi id="recentKnowledgeHeading" as="h2" />
          {advice.hasParcels ? (
            <BiValue value={strings.adviceForYourHint} as="p" className="hint" />
          ) : (
            <BiValue value={strings.adviceNoParcelsHint} as="p" className="hint" />
          )}
          {advice.items.map((a) => (
            <Link to={`/knowledge/${a.id}`} key={a.id} className="case-item advice-item">
              <div className="label">{a.title}</div>
              <div className="meta">
                {[a.crop?.name ?? a.cropName, a.category ? `${caseCategoryLabel(a.category.name).en} / ${caseCategoryLabel(a.category.name).te}` : null, a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
              {a.why !== 'LATEST' && (
                <span className="priority-badge">
                  {a.why === 'YOUR_CASE' ? `${strings.adviceWhyYourCase.en} / ${strings.adviceWhyYourCase.te}` : `${strings.adviceWhyYourCrop.en} / ${strings.adviceWhyYourCrop.te}`}
                </span>
              )}
              <p className="advice-snippet">{a.expertSolution.length > 140 ? `${a.expertSolution.slice(0, 140)}…` : a.expertSolution}</p>
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <div className="card">
          <div className="top-bar">
            <Bi id="farmLandParcelsHeading" as="h2" />
            <button type="button" className="secondary" onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? <Bi id="cancelButton" /> : <Bi id="addParcelButton" />}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddFarm}>
              <label>
                <Bi id="parcelLabelField" />
                <input
                  name="label"
                  placeholder={biInline('parcelLabelField')}
                  onChange={clearCustomValidity}
                  onInvalid={bilingualInvalidHandler}
                  required
                />
              </label>
              <label>
                <Bi id="addressField" />
                <input
                  name="address"
                  placeholder={biInline('addressField')}
                  onChange={clearCustomValidity}
                  onInvalid={bilingualInvalidHandler}
                  required
                />
              </label>
              <label>
                <Bi id="landSizeField" />
                <input
                  name="landSizeAcres"
                  type="number"
                  step="0.01"
                  min="0.01"
                  onChange={clearCustomValidity}
                  onInvalid={bilingualInvalidHandler}
                  required
                />
              </label>
              <div>
                <Bi id="cropsPickLabel" />
                <CropChips options={cropNames} value={newCrops} onChange={setNewCrops} />
              </div>
              <div>
                {coords ? (
                  <>
                    <BiValue value={strings.locationCapturedNotice} as="p" className="hint" />
                    <button type="button" className="secondary" onClick={() => setCoords(null)}>
                      <Bi id="removeLocationButton" />
                    </button>
                  </>
                ) : (
                  <button type="button" className="secondary" onClick={handleUseLocation} disabled={locating}>
                    {locating ? <BiValue value={strings.locatingButton} /> : <Bi id="useLocationButton" />}
                  </button>
                )}
              </div>
              <button type="submit">
                <Bi id="saveParcelButton" />
              </button>
            </form>
          )}

          {removeNotice && (
            <div className="hint" role="status">
              {removeNotice}
            </div>
          )}
          {farms.length === 0 && !showAddForm && <BiValue value={strings.noParcelsYet} as="p" className="hint" />}

          {farms.length > 1 && (
            <ListBar
              search={parcelSearch}
              onSearch={setParcelSearch}
              sort={parcelSort}
              onSort={setParcelSort}
              sorts={[
                { value: 'newest', label: strings.sortNewestFirst },
                { value: 'oldest', label: strings.sortOldestFirst },
                { value: 'name', label: strings.sortNameAZ },
                { value: 'size', label: strings.sortLargestFirst },
              ]}
            />
          )}
          {farms.length > 0 && shownFarms.length === 0 && <BiValue value={strings.noMatchesNotice} as="p" className="hint" />}
          {shownFarms.map((farm) => (
            <ParcelCard
              key={farm.id}
              farm={farm}
              samples={samples.filter((x) => x.farmLandId === farm.id)}
              cropOptions={cropNames}
              removing={removingId === farm.id}
              onUpdated={(updated) => {
                setFarms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
                // advice is matched to the crops on the parcels
                if (session) void getAdviceForMe(session.accessToken).then(setAdvice).catch(() => undefined);
              }}
              onDelete={handleRemoveFarm}
            />
          ))}
        </div>
      )}
    </>
  );
}
