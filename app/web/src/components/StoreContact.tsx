import { useEffect, useState } from 'react';
import { getPublicSettings } from '../api/hariharaa';
import { Bi } from '../i18n/Bi';

// The store's phone number, as set by an Administrator (Hariharaa settings). Fetched once and
// shared, so the forgot-password page, Help and the chat can all say whom to call without each
// hitting the server. Shows nothing until a number has been set.
let cached: string | null | undefined;
let inflight: Promise<string | null> | null = null;

function loadContactPhone(): Promise<string | null> {
  if (cached !== undefined) return Promise.resolve(cached);
  inflight ??= getPublicSettings()
    .then((s) => (cached = s.contactPhone ?? null))
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useContactPhone(): string | null {
  const [phone, setPhone] = useState<string | null>(cached ?? null);
  useEffect(() => {
    let live = true;
    void loadContactPhone().then((p) => live && setPhone(p));
    return () => {
      live = false;
    };
  }, []);
  return phone;
}

export function StoreContact({ className = 'hint' }: { className?: string }) {
  const phone = useContactPhone();
  if (!phone) return null;
  const dial = phone.replace(/[^0-9+]/g, '');
  return (
    <p className={className}>
      <Bi id="storeContactLabel" />{' '}
      <a href={`tel:${dial}`}>
        <strong>{phone}</strong>
      </a>
    </p>
  );
}
