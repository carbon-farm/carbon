import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { setCaseCategory, type Case } from '../api/cases';
import { listCaseCategories, type CaseCategory } from '../api/configuration';
import { Bi, BiValue, biInline } from '../i18n/Bi';
import { caseCategoryLabel, strings } from '../i18n/strings';

// One fetch of the category list per sign-in, shared by every case on the page.
let cached: { token: string; promise: Promise<CaseCategory[]> } | null = null;
function categoriesFor(token: string) {
  if (!cached || cached.token !== token) cached = { token, promise: listCaseCategories(token) };
  return cached.promise;
}

// Moderators, and the expert a case is assigned to, set the real category (it starts as Unknown Problem).
export function CaseCategoryEditor({ theCase, onChanged }: { theCase: Case; onChanged: (updated: Case) => void }) {
  const { session } = useAuth();
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    categoriesFor(session.accessToken)
      .then(setCategories)
      .catch(() => {
        cached = null;
      });
  }, [session]);

  async function change(categoryId: string) {
    if (!session || !categoryId || categoryId === theCase.categoryId) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      onChanged(await setCaseCategory(session.accessToken, theCase.id, categoryId));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.genericError.en} / ${strings.genericError.te}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="category-editor">
      <label>
        <Bi id="categoryLabel" />
        <select value={theCase.categoryId} disabled={busy || categories.length === 0} onChange={(e) => change(e.target.value)} aria-label={biInline('categoryLabel')}>
          {categories.length === 0 && <option value={theCase.categoryId}>{caseCategoryLabel(theCase.category.name).en}</option>}
          {categories.map((c) => {
            const label = caseCategoryLabel(c.name);
            return (
              <option key={c.id} value={c.id}>
                {label.en} / {label.te}
              </option>
            );
          })}
        </select>
      </label>
      <BiValue value={strings.caseCategoryHint} as="p" className="hint" />
      {saved && (
        <p className="success-banner" role="status">
          <BiValue value={strings.caseCategorySaved} />
        </p>
      )}
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
