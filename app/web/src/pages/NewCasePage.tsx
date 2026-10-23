import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listFarms, type FarmLand } from '../api/farms';
import { listCaseCategories, listCrops, type CaseCategory, type Crop } from '../api/configuration';
import { createCaseDraft, submitCase, uploadCaseEvidence } from '../api/cases';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';
import { SYMPTOMS } from '../help/caseSymptoms';
import { VoiceInput } from '../components/VoiceInput';
import { shrinkImage } from '../lib/image';

const MAX_PHOTOS = 6;

interface Photo {
  id: string;
  file: File;
  url: string;
}

// Describing a problem in the field is easiest with the phone's camera and the fewest keystrokes,
// so the order is: photos first, then tap the symptoms you see (or speak / type it), then the
// details. Photos are shrunk on the phone before upload.
export function NewCasePage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [farms, setFarms] = useState<FarmLand[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'draft' | 'submit' | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);

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

  // Free the preview URLs when leaving.
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const room = MAX_PHOTOS - photos.length;
    const chosen = Array.from(list)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, Math.max(0, room));
    setPhotos((prev) => [...prev, ...chosen.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file, url: URL.createObjectURL(file) }))]);
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function toggleSymptom(id: string) {
    setSymptoms((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  // The expert reads English or Telugu, so each chosen symptom is written in both.
  const symptomText = useMemo(
    () =>
      symptoms
        .map((id) => SYMPTOMS.find((s) => s.id === id))
        .filter((s): s is (typeof SYMPTOMS)[number] => !!s)
        .map((s) => `${s.label.en} (${s.label.te})`)
        .join('; '),
    [symptoms],
  );

  const fullDescription = [symptomText && `${strings.caseSymptomsPrefix.en} / ${strings.caseSymptomsPrefix.te}: ${symptomText}.`, description.trim()]
    .filter(Boolean)
    .join('\n');

  async function handleAction(thenSubmit: boolean) {
    const form = formRef.current;
    if (!session || !form) return;
    if (!form.reportValidity()) return;
    if (fullDescription.length < 5) {
      setError(`${strings.describeProblemRequired.en} / ${strings.describeProblemRequired.te}`);
      return;
    }

    setError(null);
    setBusy(thenSubmit ? 'submit' : 'draft');

    const data = new FormData(form);
    try {
      const created = await createCaseDraft(session.accessToken, {
        farmLandId: String(data.get('farmLandId') ?? ''),
        categoryId: String(data.get('categoryId') ?? ''),
        cropId: String(data.get('cropId') ?? '') || undefined,
        problemDescription: fullDescription,
        evidenceNotes: String(data.get('evidenceNotes') ?? '') || undefined,
        requestPriority: data.get('requestPriority') === 'on',
      });
      setSavedCaseId(created.id);

      // Photos go on before the case is sent, so the expert sees them from the start.
      let failed = 0;
      for (const p of photos) {
        try {
          await uploadCaseEvidence(session.accessToken, created.id, await shrinkImage(p.file));
        } catch {
          failed += 1;
        }
      }
      if (failed > 0) {
        setError(
          `${strings.casePhotosFailed.en.replace('{n}', String(failed))} / ${strings.casePhotosFailed.te.replace('{n}', String(failed))}`,
        );
        setBusy(null);
        return; // stay here: the case is saved, and the link below opens it so photos can be added
      }

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
    <>
      <div>
        <Bi id="newCaseEyebrow" as="span" className="eyebrow" />
        <Bi id="newCaseTitle" as="h1" />
      </div>

      {error && <div className="error-banner">{error}</div>}
      {savedCaseId && error && (
        <Link to={`/cases/${savedCaseId}`} className="link-button">
          <Bi id="openMyCaseLink" />
        </Link>
      )}

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
          <section className="card case-step">
            <Bi id="casePhotosHeading" as="h2" />
            <BiValue value={strings.casePhotosHint} as="p" className="hint" />
            <div className="photo-picker">
              <button type="button" onClick={() => cameraRef.current?.click()} disabled={photos.length >= MAX_PHOTOS}>
                <span aria-hidden="true">📷</span> <Bi id="casePhotoTake" />
              </button>
              <button type="button" className="secondary" onClick={() => galleryRef.current?.click()} disabled={photos.length >= MAX_PHOTOS}>
                <span aria-hidden="true">🖼️</span> <Bi id="casePhotoChoose" />
              </button>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => addFiles(e.target.files)} />
              <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            </div>
            {photos.length > 0 && (
              <div className="photo-grid">
                {photos.map((p) => (
                  <div className="photo-tile" key={p.id}>
                    <img src={p.url} alt="" />
                    <button type="button" className="photo-remove" onClick={() => removePhoto(p.id)} aria-label={biInline('casePhotoRemove')}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <small className="hint">
              {photos.length}/{MAX_PHOTOS}
            </small>
          </section>

          <section className="card case-step">
            <Bi id="caseSymptomsHeading" as="h2" />
            <BiValue value={strings.caseSymptomsHint} as="p" className="hint" />
            <div className="symptom-grid" role="group" aria-label={biInline('caseSymptomsHeading')}>
              {SYMPTOMS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className={symptoms.includes(s.id) ? 'symptom chip-on' : 'symptom secondary'}
                  aria-pressed={symptoms.includes(s.id)}
                  onClick={() => toggleSymptom(s.id)}
                >
                  <span className="symptom-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <span className="bi-en">{s.label.en}</span>
                  <span className="bi-te">{s.label.te}</span>
                </button>
              ))}
            </div>

            <label>
              <Bi id="problemDescriptionField" />
              <textarea
                name="problemDescription"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearCustomValidity(e);
                }}
                placeholder={biInline('problemDescriptionField')}
                rows={4}
              />
            </label>
            <VoiceInput onText={(t) => setDescription((d) => (d ? `${d} ${t}` : t))} />
            <small className="hint">
              <Bi id="voiceTip" />
            </small>
          </section>

          <section className="card case-step">
            <Bi id="caseDetailsHeading" as="h2" />
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
              <Bi id="evidenceNotesField" />
              <textarea name="evidenceNotes" placeholder={biInline('evidenceNotesField')} rows={3} />
            </label>

            <label className="checkbox-label">
              <input type="checkbox" name="requestPriority" />
              <Bi id="requestPriorityLabel" />
            </label>
          </section>

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
    </>
  );
}
