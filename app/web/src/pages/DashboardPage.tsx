import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createFarm, listFarms, type FarmLand } from '../api/farms';
import { listMyCases, type Case } from '../api/cases';
import { listPublishedArticles, type Article } from '../api/knowledge';
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
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!session) return;
    Promise.all([listFarms(session.accessToken), listMyCases(session.accessToken), listPublishedArticles(session.accessToken)])
      .then(([farmsResult, casesResult, articlesResult]) => {
        setFarms(farmsResult);
        setCases(casesResult);
        setRecentArticles(articlesResult.slice(0, 3));
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

  const askedCount = cases.filter((c) => c.status !== 'DRAFT').length;
  const pendingCount = cases.filter((c) => PENDING_STATUSES.includes(c.status)).length;
  const closedCount = cases.filter((c) => c.status === 'CLOSED').length;

  async function handleAddFarm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const form = new FormData(event.currentTarget);
    const label = String(form.get('label') ?? '');
    const address = String(form.get('address') ?? '');
    const landSizeAcres = Number(form.get('landSizeAcres') ?? 0);
    const primaryCrops = String(form.get('primaryCrops') ?? '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

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
      event.currentTarget.reset();
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
    <div className="screen">
      <div className="top-bar">
        <div>
          <Bi id="dashboardEyebrow" as="span" className="eyebrow" />
          <Bi id="yourFarms" as="h1" />
        </div>
        <button type="button" className="secondary" onClick={logout}>
          <Bi id="logoutButton" />
        </button>
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

      <BiValue value={strings.stage1Notice} as="p" className="hint" />

      {error && <div className="error-banner">{error}</div>}

      {recentArticles.length > 0 && (
        <div className="card">
          <Bi id="recentKnowledgeHeading" as="h2" />
          {recentArticles.map((a) => (
            <Link to={`/knowledge/${a.id}`} key={a.id} className="case-item">
              <div className="label">{a.title}</div>
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
              <label>
                <Bi id="cropsField" />
                <input
                  name="primaryCrops"
                  placeholder={biInline('cropsField')}
                  onChange={clearCustomValidity}
                  onInvalid={bilingualInvalidHandler}
                  required
                />
              </label>
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

          {farms.length === 0 && !showAddForm && <BiValue value={strings.noParcelsYet} as="p" className="hint" />}

          {farms.map((farm) => (
            <div className="farm-item" key={farm.id}>
              <div className="label">{farm.label}</div>
              <div className="meta">
                {farm.address} · {farm.landSizeAcres} acres · {farm.primaryCrops.join(', ')}
              </div>
              {farm.latitude != null && farm.longitude != null && (
                <a
                  href={`https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-button"
                >
                  {strings.viewOnMapLink.en} / {strings.viewOnMapLink.te}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
