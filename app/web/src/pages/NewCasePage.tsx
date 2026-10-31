import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { listFarms, type FarmLand } from '../api/farms';
import { getCase } from '../api/cases';
import { listCaseCategories, listCrops, type CaseCategory, type Crop } from '../api/configuration';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';
import { bilingualInvalidHandler, clearCustomValidity } from '../i18n/validation';
import { FIELD_QUESTIONS, LEGACY_SYMPTOM_LABELS, SOIL_QUESTIONS, SYMPTOMS } from '../help/caseSymptoms';
import { ChoiceQuestions } from '../components/ChoiceQuestions';
import { VoiceInput } from '../components/VoiceInput';
import { CropSelect } from '../components/CropSelect';
import { cropLabel } from '../lib/crops';
import { buildDescription, isNetworkFailure, sendCase } from '../lib/caseSend';
import { clearDraft, draftKeyFor, isEmptyDraft, loadDraft, saveDraft, type CaseDraftFields } from '../lib/draftStore';

const MAX_PHOTOS = 6;
const OTHER_CROP = '__other__';
const AUTOSAVE_MS = 700;

interface Photo {
  id: string;
  file: File;
  url: string;
}

const photoFrom = (file: File): Photo => ({ id: `${file.name}-${file.size}-${Math.random()}`, file, url: URL.createObjectURL(file) });

// Describing a problem in the field is easiest with the phone's camera and the fewest keystrokes,
// so the order is: photos first, then tap the symptoms you see (or speak / type it), then the
// details. Photos are shrunk on the phone before upload. Whatever is on the screen is kept on the
// phone as you go, so a dropped signal or a closed page loses nothing — and if you press Send with
// no connection, the case waits on the phone and is sent by itself when a connection returns.
export function NewCasePage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  // ?from=<caseId>: this report follows up an earlier case whose advice did not work.
  const [searchParams] = useSearchParams();
  const relatedCaseId = searchParams.get('from') ?? '';
  const [relatedLabel, setRelatedLabel] = useState<string | null>(null);
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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [description, setDescription] = useState('');
  const [farmLandId, setFarmLandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cropId, setCropId] = useState('');
  const [cropName, setCropName] = useState('');
  // "Other crop" stays open while its box is emptied to retype
  const [otherCrop, setOtherCrop] = useState(false);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [requestPriority, setRequestPriority] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [queuedNotice, setQueuedNotice] = useState(false);
  // Autosave only starts once any earlier draft has been read, so it cannot overwrite it.
  const [ready, setReady] = useState(false);

  const draftKey = session ? draftKeyFor(session.accessToken) : null;

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

  // Pick up where the farmer left off.
  useEffect(() => {
    if (!draftKey) return;
    let cancelled = false;
    loadDraft(draftKey).then((d) => {
      if (cancelled) return;
      if (d) {
        setFarmLandId(d.fields.farmLandId);
        setCategoryId(d.fields.categoryId);
        setCropId(d.fields.cropId);
        setCropName(d.fields.cropName ?? '');
        setOtherCrop(!!d.fields.cropName?.trim());
        setEvidenceNotes(d.fields.evidenceNotes);
        setRequestPriority(d.fields.requestPriority);
        // a draft kept from before some buttons were reworded may name ones that no longer exist:
        // weeds became a question, and the soil button is now written into the description
        setSymptoms(d.fields.symptoms.filter((id) => SYMPTOMS.some((s) => s.id === id)));
        setAnswers({ ...(d.fields.symptoms.includes('weeds') ? { weeds: 'high' } : {}), ...(d.fields.answers ?? {}) });
        const soil = d.fields.symptoms.includes('soil') ? `${LEGACY_SYMPTOM_LABELS.soil.en} / ${LEGACY_SYMPTOM_LABELS.soil.te}` : '';
        setDescription(soil && !d.fields.description.includes(soil) ? [d.fields.description, soil].filter(Boolean).join('\n') : d.fields.description);
        setPhotos(d.photos.map(photoFrom));
        setRestored(!isEmptyDraft(d.fields, d.photos));
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [draftKey]);

  // Following up an earlier case: say which one, and start from its parcel, category and crop.
  const prefilledFrom = useRef('');
  useEffect(() => {
    if (!ready || !session || !relatedCaseId || prefilledFrom.current === relatedCaseId) return;
    prefilledFrom.current = relatedCaseId;
    getCase(session.accessToken, relatedCaseId)
      .then((c) => {
        setRelatedLabel(c.caseNumber ?? c.id.slice(0, 8));
        setFarmLandId((v) => v || c.farmLandId);
        setCategoryId((v) => v || c.categoryId);
        if (!cropId && !cropName) {
          if (c.cropId) setCropId(c.cropId);
          else if (c.cropName) {
            setCropName(c.cropName);
            setOtherCrop(true);
          }
        }
      })
      .catch(() => setRelatedLabel(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session, relatedCaseId]);

  // The crop choices: what this parcel grows first, then every crop we know, then "other".
  const parcelCrops = useMemo(() => farms.find((f) => f.id === farmLandId)?.primaryCrops ?? [], [farms, farmLandId]);
  const cropSelectValue = cropId || (cropName.trim() || otherCrop ? OTHER_CROP : '');
  function pickParcelCrop(name: string) {
    const known = crops.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (known) {
      setCropId(known.id);
      setCropName('');
      setOtherCrop(false);
    } else {
      setCropId('');
      setCropName(name);
      setOtherCrop(true);
    }
  }

  // Free the preview URLs when leaving.
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  const fields: CaseDraftFields = useMemo(
    () => ({ farmLandId, categoryId, cropId, cropName, relatedCaseId, description, evidenceNotes, requestPriority, symptoms, answers }),
    [farmLandId, categoryId, cropId, cropName, relatedCaseId, description, evidenceNotes, requestPriority, symptoms, answers],
  );

  // Keep what is on the screen safe on the phone as it changes.
  useEffect(() => {
    if (!ready || !draftKey || busy || savedCaseId || queuedNotice) return;
    const t = setTimeout(() => {
      const files = photos.map((p) => p.file);
      if (isEmptyDraft(fields, files)) void clearDraft(draftKey);
      else void saveDraft(draftKey, { fields, photos: files, queued: false, thenSubmit: false, savedAt: Date.now() });
    }, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [ready, draftKey, fields, photos, busy, savedCaseId, queuedNotice]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const room = MAX_PHOTOS - photos.length;
    const chosen = Array.from(list)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, Math.max(0, room));
    setPhotos((prev) => [...prev, ...chosen.map(photoFrom)]);
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

  // Tap an answer to choose it, tap it again to clear it.
  function pickAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const next = { ...prev };
      if (next[questionId] === optionId) delete next[questionId];
      else next[questionId] = optionId;
      return next;
    });
  }

  function startOver() {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setSymptoms([]);
    setAnswers({});
    setDescription('');
    setFarmLandId('');
    setCategoryId('');
    setCropId('');
    setCropName('');
    setOtherCrop(false);
    setEvidenceNotes('');
    setRequestPriority(false);
    setRestored(false);
    setQueuedNotice(false);
    setError(null);
    if (draftKey) void clearDraft(draftKey);
  }

  // The field answers alone do not describe a problem: a symptom or some words are still needed.
  const fullDescription = buildDescription(symptoms, {}, description);

  async function handleAction(thenSubmit: boolean) {
    const form = formRef.current;
    if (!session || !form || !draftKey) return;
    if (!form.reportValidity()) return;
    if (fullDescription.length < 5) {
      setError(`${strings.describeProblemRequired.en} / ${strings.describeProblemRequired.te}`);
      return;
    }

    setError(null);
    setQueuedNotice(false);
    setBusy(thenSubmit ? 'submit' : 'draft');
    const files = photos.map((p) => p.file);

    // No signal: keep it on the phone and let the app send it when a connection returns.
    const queueIt = async () => {
      await saveDraft(draftKey, { fields, photos: files, queued: true, thenSubmit, savedAt: Date.now() });
      setQueuedNotice(true);
    };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await queueIt();
      setBusy(null);
      return;
    }

    try {
      const result = await sendCase(session.accessToken, fields, files, thenSubmit);
      setSavedCaseId(result.caseId);
      await clearDraft(draftKey);
      if (result.failedPhotos > 0) {
        setError(
          `${strings.casePhotosFailed.en.replace('{n}', String(result.failedPhotos))} / ${strings.casePhotosFailed.te.replace('{n}', String(result.failedPhotos))}`,
        );
        return; // stay here: the case is saved, and the link below opens it so photos can be added
      }
      if (result.submitError) setError(result.submitError);
      navigate(`/cases/${result.caseId}`);
    } catch (err) {
      if (isNetworkFailure(err)) await queueIt();
      else setError(err instanceof ApiError ? err.message : `${strings.couldNotCreateCase.en} / ${strings.couldNotCreateCase.te}`);
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

      {relatedCaseId && (
        <div className="payment-strip" role="status">
          {strings.followUpOf.en.replace('{n}', relatedLabel ?? '…')} / {strings.followUpOf.te.replace('{n}', relatedLabel ?? '…')}
        </div>
      )}
      {error && <div className="error-banner">{error}</div>}
      {savedCaseId && error && (
        <Link to={`/cases/${savedCaseId}`} className="link-button">
          <Bi id="openMyCaseLink" />
        </Link>
      )}
      {queuedNotice && (
        <div className="payment-strip" role="status">
          <BiValue value={strings.caseQueuedNotice} />
        </div>
      )}
      {restored && !queuedNotice && (
        <div className="payment-strip" role="status">
          <BiValue value={strings.caseDraftRestored} />{' '}
          <button type="button" className="link-button" onClick={startOver}>
            <Bi id="caseStartOver" />
          </button>
        </div>
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
                  <span className="bi-en">{s.question.en}</span>
                  <span className="bi-te">{s.question.te}</span>
                </button>
              ))}
            </div>

            <ChoiceQuestions questions={SOIL_QUESTIONS} answers={answers} onPick={pickAnswer} />

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
            <ChoiceQuestions questions={FIELD_QUESTIONS} answers={answers} onPick={pickAnswer} />
            <label>
              <Bi id="farmLandFieldLabel" />
              <select
                name="farmLandId"
                required
                value={farmLandId}
                onChange={(e) => {
                  setFarmLandId(e.target.value);
                  clearCustomValidity(e);
                }}
                onInvalid={bilingualInvalidHandler}
              >
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
              <select
                name="categoryId"
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  clearCustomValidity(e);
                }}
                onInvalid={bilingualInvalidHandler}
              >
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

            <div className="field-group">
              <Bi id="articleCropField" />
              {parcelCrops.length > 0 && (
                <div className="chip-row" role="group" aria-label={biInline('cropsOnParcel')}>
                  <span className="hint">
                    <Bi id="cropsOnParcel" />
                  </span>
                  {parcelCrops.map((name) => {
                    const on = (cropId && crops.find((c) => c.id === cropId)?.name.toLowerCase() === name.trim().toLowerCase()) || (!cropId && cropName.trim().toLowerCase() === name.trim().toLowerCase());
                    return (
                      <button key={name} type="button" className={on ? 'chip-on' : 'secondary'} aria-pressed={!!on} onClick={() => pickParcelCrop(name)}>
                        {cropLabel(crops.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? { name })}
                      </button>
                    );
                  })}
                </div>
              )}
              <CropSelect
                crops={crops}
                name="cropId"
                ariaLabel={biInline('articleCropField')}
                value={cropSelectValue}
                emptyLabel={biInline('selectPlaceholder')}
                extraOptions={[{ value: OTHER_CROP, label: biInline('cropOtherOption') }]}
                onChange={(v) => {
                  if (v === OTHER_CROP) {
                    setCropId('');
                    setOtherCrop(true);
                  } else {
                    setCropId(v);
                    setCropName('');
                    setOtherCrop(false);
                  }
                }}
              />
              {cropSelectValue === OTHER_CROP && (
                <input
                  type="text"
                  name="cropName"
                  maxLength={60}
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value.replace(/^\s+/, ''))}
                  placeholder={biInline('cropOtherPlaceholder')}
                  aria-label={biInline('cropOtherPlaceholder')}
                />
              )}
            </div>

            <label>
              <Bi id="evidenceNotesField" />
              <textarea name="evidenceNotes" value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} placeholder={biInline('evidenceNotesField')} rows={3} />
            </label>

            <label className="checkbox-label">
              <input type="checkbox" name="requestPriority" checked={requestPriority} onChange={(e) => setRequestPriority(e.target.checked)} />
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
