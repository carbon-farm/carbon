import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { listCropCategories, type CropCategory } from '../api/configuration';

// The crop groups, fetched once per sign-in and shared by every picker on screen (several can be on
// one page). After an Administrator changes the groups, reload() fetches them afresh.
let cached: { token: string; promise: Promise<CropCategory[]> } | null = null;
// every picker on screen listens, so a change made in the admin groups table shows in the others at once
const listeners = new Set<(c: CropCategory[]) => void>();

function fetchCategories(token: string, force: boolean): Promise<CropCategory[]> {
  if (force || !cached || cached.token !== token) {
    const promise = listCropCategories(token).catch((err) => {
      if (cached?.promise === promise) cached = null; // try again next time
      throw err;
    });
    cached = { token, promise };
  }
  return cached.promise;
}

export function useCropCategories(): { categories: CropCategory[]; reload: () => Promise<void> } {
  const { session } = useAuth();
  const token = session?.accessToken;
  const [categories, setCategories] = useState<CropCategory[]>([]);

  useEffect(() => {
    if (!token) return;
    let live = true;
    listeners.add(setCategories);
    fetchCategories(token, false)
      .then((c) => live && setCategories(c))
      .catch(() => undefined); // pickers still work, ungrouped, if the groups cannot be loaded
    return () => {
      live = false;
      listeners.delete(setCategories);
    };
  }, [token]);

  const reload = useCallback(async () => {
    if (!token) return;
    const fresh = await fetchCategories(token, true);
    listeners.forEach((l) => l(fresh));
  }, [token]);

  return { categories, reload };
}
