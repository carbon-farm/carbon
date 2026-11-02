import { type Case } from '../api/cases';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, caseCategoryLabel } from '../i18n/strings';
import { cropAgeDays, cropAgeText } from '../lib/cropAge';

const isImage = (url: string) => /\.(jpe?g|png|webp)$/i.test(url);

// Everything the farmer gave on a case, read-only: for the moderator choosing who to assign it to,
// and for the expert who has to answer it. (Testers: "only assigning is shown", "less info".)
export function CaseFacts({ theCase }: { theCase: Case }) {
  const parcel = theCase.farmLand;
  const cropName = theCase.crop?.name ?? theCase.cropName;
  const cropAge = cropAgeDays(parcel, cropName);
  const sentOn = theCase.submittedAt ? new Date(theCase.submittedAt).toLocaleDateString() : null;

  return (
    <div className="case-facts">
      <div>
        <div className="field-label"><Bi id="parcelLabel" /></div>
        <div>{parcel.label}</div>
      </div>
      {parcel.address && (
        <div>
          <div className="field-label"><BiValue value={strings.caseFactsAddress} /></div>
          <div>{parcel.address}</div>
        </div>
      )}
      {parcel.landSizeAcres != null && (
        <div>
          <div className="field-label"><BiValue value={strings.caseFactsSize} /></div>
          <div>
            {strings.caseFactsAcres.en.replace('{n}', String(parcel.landSizeAcres))} / {strings.caseFactsAcres.te.replace('{n}', String(parcel.landSizeAcres))}
          </div>
        </div>
      )}
      {parcel.latitude != null && parcel.longitude != null && (
        <div>
          <div className="field-label"><BiValue value={strings.caseFactsLocation} /></div>
          <a href={`https://www.google.com/maps?q=${parcel.latitude},${parcel.longitude}`} target="_blank" rel="noopener noreferrer" className="link-button">
            {parcel.latitude.toFixed(5)}, {parcel.longitude.toFixed(5)} · {strings.viewOnMapLink.en} / {strings.viewOnMapLink.te}
          </a>
        </div>
      )}
      {parcel.primaryCrops && parcel.primaryCrops.length > 0 && (
        <div>
          <div className="field-label"><BiValue value={strings.caseFactsCropsOnParcel} /></div>
          <ul className="plain-list">
            {parcel.primaryCrops.map((name) => {
              const days = cropAgeDays(parcel, name);
              return (
                <li key={name}>
                  {name}
                  {days !== null && (
                    <span className="hint">
                      {' '}· {cropAgeText(days).en} / {cropAgeText(days).te}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div>
        <div className="field-label"><Bi id="categoryLabel" /></div>
        <div><BiValue value={caseCategoryLabel(theCase.category.name)} /></div>
      </div>
      {cropName && (
        <div>
          <div className="field-label"><Bi id="articleCropField" /></div>
          <div>
            {cropName}
            {cropAge !== null && (
              <span className="hint">
                {' '}· {cropAgeText(cropAge).en} / {cropAgeText(cropAge).te}
              </span>
            )}
          </div>
        </div>
      )}
      {sentOn && (
        <div>
          <div className="field-label"><BiValue value={strings.caseFactsSubmitted} /></div>
          <div>{sentOn}</div>
        </div>
      )}
      {theCase.priorityRequested && <BiValue value={strings.caseFactsPriorityAsked} as="p" className="hint" />}
      <div>
        <div className="field-label"><Bi id="problemLabel" /></div>
        <div className="case-facts-problem">{theCase.problemDescription}</div>
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
              isImage(url) ? (
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
    </div>
  );
}
