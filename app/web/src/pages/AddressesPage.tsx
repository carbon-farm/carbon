import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress, type Address, type AddressInput } from '../api/addresses';
import { AddressBlock } from '../components/AddressBlock';
import { AddressForm } from '../components/AddressForm';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// The member's address book — saved once, picked at checkout. An order keeps its own copy of
// the address it was placed with, so editing or deleting one here never moves an order.
export function AddressesPage() {
  const { session, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!session) return;
    try {
      setAddresses(await listAddresses(session.accessToken));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadAddresses.en} / ${strings.couldNotLoadAddresses.te}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function save(data: AddressInput) {
    if (!session || !editing) return;
    setSaving(true);
    setError(null);
    try {
      if (editing === 'new') await createAddress(session.accessToken, data);
      else await updateAddress(session.accessToken, editing.id, data);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSaveAddress.en} / ${strings.couldNotSaveAddress.te}`);
    } finally {
      setSaving(false);
    }
  }

  async function act(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSaveAddress.en} / ${strings.couldNotSaveAddress.te}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="top-bar">
        <div>
          <Bi id="accountNavTitle" as="span" className="eyebrow" />
          <Bi id="addressesPageTitle" as="h1" />
        </div>
        {editing === null && (
          <button type="button" onClick={() => setEditing('new')}>
            <Bi id="addAddressButton" />
          </button>
        )}
      </div>
      <BiValue value={strings.addressesHint} as="p" className="hint" />

      {error && <div className="error-banner">{error}</div>}

      {editing !== null && (
        <div className="card">
          <Bi id={editing === 'new' ? 'addAddressButton' : 'addrEditHeading'} as="h2" />
          <AddressForm initial={editing === 'new' ? undefined : editing} submitting={saving} onSubmit={save} onCancel={() => setEditing(null)} />
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : addresses.length === 0 ? (
        editing === null && <BiValue value={strings.noAddressesYet} as="p" className="hint" />
      ) : (
        <div className="product-grid">
          {addresses.map((a) => (
            <div className="farm-item" key={a.id}>
              <div className="label">
                {a.label || strings.addrUntitled.en}
                {a.isDefault && <span className="priority-badge"> ★ {strings.addrDefaultBadge.en}</span>}
              </div>
              <AddressBlock address={a} />
              <div className="form-actions">
                <button type="button" className="secondary" onClick={() => setEditing(a)} disabled={busyId === a.id}>
                  <Bi id="addrEditButton" />
                </button>
                {!a.isDefault && (
                  <button type="button" className="secondary" onClick={() => act(a.id, () => setDefaultAddress(session!.accessToken, a.id))} disabled={busyId === a.id}>
                    <Bi id="addrMakeDefaultButton" />
                  </button>
                )}
                <button type="button" className="secondary" onClick={() => act(a.id, () => deleteAddress(session!.accessToken, a.id))} disabled={busyId === a.id}>
                  <Bi id="addrDeleteButton" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
