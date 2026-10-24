import { ApiError } from '../api/client';
import { createCaseDraft, submitCase, uploadCaseEvidence } from '../api/cases';
import { SYMPTOMS } from '../help/caseSymptoms';
import { strings } from '../i18n/strings';
import { shrinkImage } from './image';
import type { CaseDraftFields } from './draftStore';

// The text sent to the expert: the ticked symptoms (written in English and Telugu) then the
// farmer's own words.
export function buildDescription(symptomIds: string[], description: string): string {
  const symptomText = symptomIds
    .map((id) => SYMPTOMS.find((s) => s.id === id))
    .filter((s): s is (typeof SYMPTOMS)[number] => !!s)
    .map((s) => `${s.label.en} (${s.label.te})`)
    .join('; ');
  return [symptomText && `${strings.caseSymptomsPrefix.en} / ${strings.caseSymptomsPrefix.te}: ${symptomText}.`, description.trim()]
    .filter(Boolean)
    .join('\n');
}

// A failed request that never reached the server (no signal, server asleep) — as opposed to the
// server answering "no". Only these are worth queueing for later.
export function isNetworkFailure(err: unknown): boolean {
  return !(err instanceof ApiError) && (err instanceof TypeError || (typeof navigator !== 'undefined' && navigator.onLine === false));
}

export interface SendResult {
  caseId: string;
  failedPhotos: number;
  // The case exists and has its photos, but sending it to the experts was refused (the message).
  submitError?: string;
}

// Creates the case, puts its photos on (shrunk first), and optionally sends it to the experts.
// Throws on a network or API failure before the case exists; once it exists, problems are reported
// in the result instead so the farmer's work is never thrown away.
export async function sendCase(token: string, fields: CaseDraftFields, photos: File[], thenSubmit: boolean): Promise<SendResult> {
  const created = await createCaseDraft(token, {
    farmLandId: fields.farmLandId,
    categoryId: fields.categoryId,
    cropId: fields.cropId || undefined,
    cropName: !fields.cropId && fields.cropName?.trim() ? fields.cropName.trim() : undefined,
    relatedCaseId: fields.relatedCaseId || undefined,
    problemDescription: buildDescription(fields.symptoms, fields.description),
    evidenceNotes: fields.evidenceNotes || undefined,
    requestPriority: fields.requestPriority,
  });

  let failedPhotos = 0;
  for (const p of photos) {
    try {
      await uploadCaseEvidence(token, created.id, await shrinkImage(p));
    } catch {
      failedPhotos += 1;
    }
  }
  if (failedPhotos > 0) return { caseId: created.id, failedPhotos };

  if (thenSubmit) {
    try {
      await submitCase(token, created.id);
    } catch (err) {
      return {
        caseId: created.id,
        failedPhotos: 0,
        submitError: err instanceof ApiError ? err.message : `${strings.couldNotSubmitCase.en} / ${strings.couldNotSubmitCase.te}`,
      };
    }
  }
  return { caseId: created.id, failedPhotos: 0 };
}
