import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  listCrops,
  createCrop,
  listCaseCategories,
  createCaseCategory,
  listTags,
  createTag,
  listRegions,
  createRegion,
  type Crop,
  type CaseCategory,
  type Tag,
  type Region,
} from '../api/configuration';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, type StringKey } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

function SimpleListSection({
  headingKey,
  items,
  onAdd,
}: {
  headingKey: StringKey;
  items: { id: string; name: string }[];
  onAdd: (name: string) => Promise<void>;
}) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    if (!value.trim()) return;
    setBusy(true);
    try {
      await onAdd(value.trim());
      setValue('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <Bi id={headingKey} as="h2" />
      {items.map((item) => (
        <div className="farm-item" key={item.id}>
          <div className="label">{item.name}</div>
        </div>
      ))}
      <label>
        <Bi id="itemNameField" />
        <input
          value={value}
          placeholder={biInline('itemNameField')}
          onChange={(e) => {
            setValue(e.target.value);
            clearCustomValidity(e);
          }}
          onInvalid={bilingualInvalidHandler}
        />
      </label>
      <button type="button" onClick={handleAdd} disabled={busy || !value.trim()}>
        {busy ? <BiValue value={strings.adding} /> : <Bi id="addButton" />}
      </button>
    </div>
  );
}

export function AdminTaxonomyPage() {
  const { session, logout } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionName, setRegionName] = useState('');
  const [regionState, setRegionState] = useState('');
  const [regionBusy, setRegionBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function load() {
    if (!session) return;
    setLoading(true);
    Promise.all([
      listCrops(session.accessToken),
      listCaseCategories(session.accessToken),
      listTags(session.accessToken),
      listRegions(session.accessToken),
    ])
      .then(([cropsResult, categoriesResult, tagsResult, regionsResult]) => {
        setCrops(cropsResult);
        setCategories(categoriesResult);
        setTags(tagsResult);
        setRegions(regionsResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadTaxonomy.en} / ${strings.couldNotLoadTaxonomy.te}`);
      })
      .finally(() => setLoading(false));
  }

  async function guarded(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddItem.en} / ${strings.couldNotAddItem.te}`);
    }
  }

  async function handleAddRegion() {
    if (!session || !regionName.trim() || !regionState.trim()) return;
    setRegionBusy(true);
    await guarded(async () => {
      const created = await createRegion(session.accessToken, regionName.trim(), regionState.trim());
      setRegions((prev) => [...prev, created]);
      setRegionName('');
      setRegionState('');
    });
    setRegionBusy(false);
  }

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="taxonomyPageTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : (
        <>
          <SimpleListSection
            headingKey="cropsHeading"
            items={crops}
            onAdd={(name) =>
              guarded(async () => {
                if (!session) return;
                const created = await createCrop(session.accessToken, name);
                setCrops((prev) => [...prev, created]);
              })
            }
          />
          <SimpleListSection
            headingKey="categoriesHeading"
            items={categories}
            onAdd={(name) =>
              guarded(async () => {
                if (!session) return;
                const created = await createCaseCategory(session.accessToken, name);
                setCategories((prev) => [...prev, created]);
              })
            }
          />
          <SimpleListSection
            headingKey="tagsHeading"
            items={tags}
            onAdd={(name) =>
              guarded(async () => {
                if (!session) return;
                const created = await createTag(session.accessToken, name);
                setTags((prev) => [...prev, created]);
              })
            }
          />

          <div className="card">
            <Bi id="regionsHeading" as="h2" />
            {regions.map((region) => (
              <div className="farm-item" key={region.id}>
                <div className="label">{region.name}</div>
                <div className="meta">{region.state}</div>
              </div>
            ))}
            <label>
              <Bi id="itemNameField" />
              <input
                value={regionName}
                placeholder={biInline('itemNameField')}
                onChange={(e) => {
                  setRegionName(e.target.value);
                  clearCustomValidity(e);
                }}
                onInvalid={bilingualInvalidHandler}
              />
            </label>
            <label>
              <Bi id="stateField" />
              <input
                value={regionState}
                placeholder={biInline('stateField')}
                onChange={(e) => {
                  setRegionState(e.target.value);
                  clearCustomValidity(e);
                }}
                onInvalid={bilingualInvalidHandler}
              />
            </label>
            <button type="button" onClick={handleAddRegion} disabled={regionBusy || !regionName.trim() || !regionState.trim()}>
              {regionBusy ? <BiValue value={strings.adding} /> : <Bi id="addButton" />}
            </button>
          </div>
        </>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
