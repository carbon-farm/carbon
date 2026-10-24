// A new case being written on a phone — photos taken in the field, symptoms ticked, words typed —
// is kept on the phone itself (IndexedDB, which can hold photos) so that nothing is lost if the
// signal drops, the page is closed, or the battery dies. A draft can also be "queued": the
// farmer pressed Send with no connection, and the app sends it by itself when one returns.
//
// Everything here is best effort: where the browser has no IndexedDB (private windows in some
// browsers) these functions quietly do nothing and the form simply works as it always did.

export interface CaseDraftFields {
  farmLandId: string;
  categoryId: string;
  cropId: string;
  // A crop typed in because it was not in the list; empty when cropId is set.
  cropName?: string;
  // The earlier case this one follows up ("that advice did not work").
  relatedCaseId?: string;
  description: string;
  evidenceNotes: string;
  requestPriority: boolean;
  symptoms: string[];
}

export interface CaseDraft {
  fields: CaseDraftFields;
  photos: File[];
  // Pressed Send/Save with no connection: send it when one returns.
  queued: boolean;
  // What to do when it is sent: submit to the experts (true) or just save as a draft case (false).
  thenSubmit: boolean;
  savedAt: number;
}

const DB_NAME = 'agriai-drafts';
const STORE = 'case-drafts';
export const DRAFT_CHANGED_EVENT = 'agriai:draft-changed';

// One draft per signed-in person, so a phone shared in a family never shows one person's case to another.
export function draftKeyFor(accessToken: string): string {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: string };
    return `new-case:${payload.sub ?? 'unknown'}`;
  } catch {
    return 'new-case:unknown';
  }
}

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  const db = await open();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      tx.oncomplete = () => db.close();
      tx.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveDraft(key: string, draft: CaseDraft): Promise<void> {
  await run('readwrite', (s) => s.put(draft, key));
  window.dispatchEvent(new Event(DRAFT_CHANGED_EVENT));
}

export async function loadDraft(key: string): Promise<CaseDraft | null> {
  const found = await run<CaseDraft | undefined>('readonly', (s) => s.get(key));
  return found ?? null;
}

export async function clearDraft(key: string): Promise<void> {
  await run('readwrite', (s) => s.delete(key));
  window.dispatchEvent(new Event(DRAFT_CHANGED_EVENT));
}

// True when there is nothing worth keeping.
export function isEmptyDraft(f: CaseDraftFields, photos: File[]): boolean {
  return !f.description.trim() && !f.evidenceNotes.trim() && f.symptoms.length === 0 && photos.length === 0 && !f.farmLandId && !f.categoryId && !f.cropId && !f.cropName?.trim();
}
