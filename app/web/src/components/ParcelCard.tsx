import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { updateFarm, type FarmLand } from '../api/farms';
import type { SoilSample } from '../api/soilLab';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, sampleStatusLabel } from '../i18n/strings';
import { CropChips } from './CropChips';
import type { Crop } from '../api/configuration';

// One parcel on the dashboard: its details (editable in place), the crops it grows, its soil tests
// with a one-tap request for another, and Delete.
export function ParcelCard({
  farm,
  samples,
  crops: cropList,
  removing,
  onUpdated,
  onDelete,
}: {
  farm: FarmLand;
  samples: SoilSample[];
  crops: Crop[];
  removing: boolean;
  onUpdated: (farm: FarmLand) => void;
  onDelete: (farm: FarmLand) => void;
}) {
  const { session } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState(farm.label);
  const [address, setAddress] = useState(farm.address);
  const [size, setSize] = useState(String(farm.landSizeAcres));
  const [crops, setCrops] = useState<string[]>(farm.primaryCrops);

  function startEdit() {
    setLabel(farm.label);
    setAddress(farm.address);
    setSize(String(farm.landSizeAcres));
    setCrops(farm.primaryCrops);
    setError(null);
    setEditing(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    if (crops.length === 0) {
      setError(`${strings.cropsRequired.en} / ${strings.cropsRequired.te}`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateFarm(session.accessToken, farm.id, {
        label: label.trim(),
        address: address.trim(),
        landSizeAcres: Number(size),
        primaryCrops: crops,
      });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setSaving(false);
    }
  }

  const addedOn = new Date(farm.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const mine = [...samples].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="farm-item">
      {editing ? (
        <form onSubmit={save}>
          {error && <div className="error-banner">{error}</div>}
          <small className="hint">
            {strings.parcelAddedOn.en.replace('{date}', addedOn)} / {strings.parcelAddedOn.te.replace('{date}', addedOn)}
          </small>
          <label>
            <Bi id="parcelLabelField" />
            <input value={label} onChange={(e) => setLabel(e.target.value)} minLength={2} required />
          </label>
          <label>
            <Bi id="addressField" />
            <input value={address} onChange={(e) => setAddress(e.target.value)} minLength={5} required />
          </label>
          <label>
            <Bi id="landSizeField" />
            <input type="number" step="0.01" min="0.01" value={size} onChange={(e) => setSize(e.target.value)} required />
          </label>
          <div>
            <Bi id="cropsPickLabel" />
            <CropChips crops={cropList} value={crops} onChange={setCrops} />
          </div>
          <div className="button-row">
            <button type="submit" disabled={saving}>
              {saving ? <BiValue value={strings.savingParcel} /> : <Bi id="saveParcelButton" />}
            </button>
            <button type="button" className="secondary" onClick={() => setEditing(false)} disabled={saving}>
              <Bi id="cancelButton" />
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="label">{farm.label}</div>
          <div className="meta">
            {farm.address} · {farm.landSizeAcres} acres · {farm.primaryCrops.join(', ')}
          </div>
          <div className="meta">
            {strings.parcelAddedOn.en.replace('{date}', addedOn)} / {strings.parcelAddedOn.te.replace('{date}', addedOn)}
          </div>
          {farm.latitude != null && farm.longitude != null && (
            <a href={`https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`} target="_blank" rel="noopener noreferrer" className="link-button">
              {strings.viewOnMapLink.en} / {strings.viewOnMapLink.te}
            </a>
          )}

          <div className="parcel-soil">
            <Bi id="parcelSoilHeading" as="strong" />
            {mine.length === 0 ? (
              <BiValue value={strings.parcelNoSoilTests} as="p" className="hint" />
            ) : (
              <ul className="plain-list">
                {mine.slice(0, 3).map((s) => {
                  const status = sampleStatusLabel(s.status);
                  return (
                    <li key={s.id}>
                      <Link to={`/soil-samples/${s.id}`} className="link-button">
                        {s.sampleCode}
                      </Link>{' '}
                      <small className="hint">
                        {status.en} / {status.te}
                      </small>
                      {s.status === 'REPORT_AVAILABLE' && s.reportUrl && (
                        <>
                          {' '}
                          <a href={s.reportUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                            {strings.viewReportLink.en} / {strings.viewReportLink.te}
                          </a>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {mine.length > 3 && (
              <Link to="/soil-samples" className="link-button">
                <Bi id="parcelAllSoilTests" />
              </Link>
            )}
            <div>
              <Link to={`/soil-samples?parcel=${farm.id}`} className="link-button">
                <Bi id="parcelRequestSoilTest" />
              </Link>
            </div>
          </div>

          <div className="button-row">
            <button type="button" className="secondary" onClick={startEdit}>
              <Bi id="parcelEditButton" />
            </button>
            <button type="button" className="secondary" onClick={() => onDelete(farm)} disabled={removing}>
              <Bi id="parcelDeleteButton" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
