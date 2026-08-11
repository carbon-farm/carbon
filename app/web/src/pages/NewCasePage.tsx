import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listFarms, type FarmLand } from '../api/farms';
import { listCaseCategories, listCrops, type CaseCategory, type Crop } from '../api/configuration';
import { createCaseDraft, submitCase } from '../api/cases';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';

export function NewCasePage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [farms, setFarms] = useState<FarmLand[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'draft' | 'submit' | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([listFarms(session.accessToken), listCaseCategories(session.accessToken), listCrops(session.accessToken)])
      .then(([farmsResult, categoriesResult, cropsResult]) => {
        setFarms(farmsResult);
        setCategories(categoriesResult);
        setCrops(cropsResult);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
      })
      .finally(() => setLoading(false));
  }, [session, logout]);

  async function handleAction(thenSubmit: boolean) {
    const form = formRef.current;
    if (!session || !form) return;
    if (!form.reportValidity()) return;

    setError(null);
    setBusy(thenSubmit ? 'submit' : 'draft');

    const data = new FormData(form);
    try {
      const created = await createCaseDraft(session.accessToken, {
        farmLandId: String(data.get('farmLandId') ?? ''),
        categoryId: String(data.get('categoryId') ?? ''),
        cropId: String(data.get('cropId') ?? '') || undefined,
        problemDescription: String(data.get('problemDescription') ?? ''),
        evidenceNotes: String(data.get('evidenceNotes') ?? '') || undefined,
        requestPriority: data.get('requestPriority') === 'on',
      });

      if (thenSubmit) {
        try {
          await submitCase(session.accessToken, created.id);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitCase.en} / ${strings.couldNotSubmitCase.te}`);
          navigate(`/cases/${created.id}`);
          return;
        }
      }
      navigate(`/cases/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotCreateCase.en} / ${strings.couldNotCreateCase.te}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="screen">
      <div>
        <Bi id="newCaseEyebrow" as="span" className="eyebrow" />
        <Bi id="newCaseTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : farms.length === 0 ? (
        <>
          <BiValue value={strings.noFarmLandsWarning} as="p" className="hint" />
          <Link to="/dashboard">
            <button type="button" className="secondary">
              <Bi id="backButton" />
            </button>
          </Link>
        </>
      ) : (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <label>
            <Bi id="farmLandFieldLabel" />
            <select name="farmLandId" required defaultValue="" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler}>
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

          <label>
            <Bi id="categoryFieldLabel" />
            <select name="categoryId" required defaultValue="" onChange={clearCustomValidity} onInvalid={bilingualInvalidHandler}>
              <option value="" disabled>
                {biInline('selectPlaceholder')}
              </option>
              {categories.map((cat) => {
                const label = caseCategoryLabel(cat.name);
                return (
                  <option key={cat.id} value={cat.id}>
                    {label.en} / {label.te}
                  </option>
                );
              })}
            </select>
          </label>

          <label>
            <Bi id="articleCropField" />
            <select name="cropId" defaultValue="">
              <option value="">{biInline('selectPlaceholder')}</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <Bi id="problemDescriptionField" />
            <textarea
              name="problemDescription"
              placeholder={biInline('problemDescriptionField')}
              onChange={clearCustomValidity}
              onInvalid={bilingualInvalidHandler}
              minLength={5}
              rows={4}
              required
            />
          </label>

          <label>
            <Bi id="evidenceNotesField" />
            <textarea name="evidenceNotes" placeholder={biInline('evidenceNotesField')} rows={3} />
          </label>

          <label className="checkbox-label">
            <input type="checkbox" name="requestPriority" />
            <Bi id="requestPriorityLabel" />
          </label>

          <button type="button" onClick={() => handleAction(false)} disabled={busy !== null}>
            {busy === 'draft' ? <BiValue value={strings.saving} /> : <Bi id="saveDraftButton" />}
          </button>
          <button type="button" className="secondary" onClick={() => handleAction(true)} disabled={busy !== null}>
            {busy === 'submit' ? <BiValue value={strings.submitting} /> : <Bi id="submitCaseButton" />}
          </button>
        </form>
      )}

      <Link to="/cases" className="link-button">
        {strings.backToCasesLink.en} / {strings.backToCasesLink.te}
      </Link>
    </div>
  );
}
