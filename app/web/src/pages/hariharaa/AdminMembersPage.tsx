import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/client';
import { grantFreeAccess, listMembers, revokeFreeAccess, type Member, type MemberLabel } from '../../api/hariharaa';
import { Bi, BiValue, biInline } from '../../i18n/Bi';
import { strings, type StringKey } from '../../i18n/strings';

type SortKey = 'userCode' | 'name' | 'mobileNumber' | 'label' | 'until' | 'createdAt';
type SortDir = 'asc' | 'desc';

const LABEL_KEYS: Record<MemberLabel, StringKey> = {
  PAID: 'memberLabelPaid',
  FREE: 'memberLabelFree',
  AWAITING: 'memberLabelAwaiting',
  EXPIRED: 'memberLabelExpired',
  UNPAID: 'memberLabelUnpaid',
};

// Default free-access end date suggested to the Administrator: the end of this year.
const defaultUntil = () => `${new Date().getFullYear()}-12-31`;

// The date access currently runs to (or last ran to) for a member — for the "Until" column.
function accessUntil(m: Member): string | null {
  const dates = [m.paidUntil, m.freeUntil].filter((d): d is string => !!d);
  return dates.length ? dates.sort()[dates.length - 1] : null;
}

// Every member with one plain label, plus the manual exception to paying: give a member
// free access until a date (testing, friends of the store) and take it away again.
// Paid days are never touched by the free switch.
export function AdminMembersPage() {
  const { session, logout } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState<'' | MemberLabel>('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [grantFor, setGrantFor] = useState<Member | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!session) return;
    try {
      setMembers(await listMembers(session.accessToken));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadMembers.en} / ${strings.couldNotLoadMembers.te}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'createdAt' || key === 'until' ? 'desc' : 'asc');
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = members.filter(
      (m) =>
        (!labelFilter || m.label === labelFilter) &&
        (!q || [m.userCode, m.name, m.mobileNumber].some((v) => v.toLowerCase().includes(q))),
    );
    const cmp = (a: Member, b: Member) => {
      switch (sortKey) {
        case 'userCode':
          return a.userCode.localeCompare(b.userCode);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'mobileNumber':
          return a.mobileNumber.localeCompare(b.mobileNumber);
        case 'label':
          return a.label.localeCompare(b.label);
        case 'until':
          return (accessUntil(a) ?? '').localeCompare(accessUntil(b) ?? '');
        default:
          return a.createdAt.localeCompare(b.createdAt);
      }
    };
    return rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [members, search, labelFilter, sortKey, sortDir]);

  const counts = useMemo(() => {
    const c: Partial<Record<MemberLabel, number>> = {};
    for (const m of members) c[m.label] = (c[m.label] ?? 0) + 1;
    return c;
  }, [members]);

  async function handleGrant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !grantFor) return;
    const data = new FormData(event.currentTarget);
    const until = String(data.get('until') ?? '');
    const note = String(data.get('note') ?? '').trim();
    setBusyId(grantFor.id);
    setError(null);
    try {
      await grantFreeAccess(session.accessToken, grantFor.id, { until, ...(note ? { note } : {}) });
      setGrantFor(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSaveFreeAccess.en} / ${strings.couldNotSaveFreeAccess.te}`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevoke(m: Member) {
    if (!session) return;
    setBusyId(m.id);
    setError(null);
    try {
      await revokeFreeAccess(session.accessToken, m.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSaveFreeAccess.en} / ${strings.couldNotSaveFreeAccess.te}`);
    } finally {
      setBusyId(null);
    }
  }

  const indicator = (key: SortKey) => (key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
  const th = (key: SortKey, en: string, te: string) => (
    <th className="sortable" onClick={() => handleSort(key)}>
      {en} / {te}
      {indicator(key)}
    </th>
  );

  return (
    <>
      <div>
        <Bi id="adminEyebrow" as="span" className="eyebrow" />
        <Bi id="membersAdminTitle" as="h1" />
      </div>
      <BiValue value={strings.membersAdminHint} as="p" className="hint" />

      {error && <div className="error-banner">{error}</div>}

      {!loading && members.length > 0 && (
        <div className="list-toolbar">
          <label>
            <Bi id="searchPlaceholder" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={biInline('searchPlaceholder')} />
          </label>
          <label>
            <Bi id="memberAccessColumn" />
            <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value as '' | MemberLabel)}>
              <option value="">{biInline('memberAllLabels')}</option>
              {(Object.keys(LABEL_KEYS) as MemberLabel[]).map((l) => (
                <option key={l} value={l}>
                  {strings[LABEL_KEYS[l]].en} / {strings[LABEL_KEYS[l]].te} ({counts[l] ?? 0})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {grantFor && (
        <div className="card">
          <h2>
            {strings.memberGrantHeading.en} {grantFor.name} ({grantFor.userCode})
          </h2>
          <BiValue value={strings.memberGrantHelp} as="p" className="hint" />
          <form onSubmit={handleGrant}>
            <label>
              <Bi id="memberGrantUntilField" />
              <input type="date" name="until" required defaultValue={grantFor.freeUntil?.slice(0, 10) ?? defaultUntil()} />
            </label>
            <label>
              <Bi id="memberGrantNoteField" />
              <input name="note" maxLength={200} defaultValue={grantFor.freeNote ?? ''} />
            </label>
            <button type="submit" disabled={busyId === grantFor.id}>
              {busyId === grantFor.id ? <BiValue value={strings.memberSaving} /> : <Bi id="memberGrantSave" />}
            </button>
            <button type="button" className="secondary" onClick={() => setGrantFor(null)}>
              <Bi id="cancelButton" />
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : visible.length === 0 ? (
        <BiValue value={strings.memberNoMatches} as="p" className="hint" />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {th('userCode', strings.memberIdColumn.en, strings.memberIdColumn.te)}
                {th('name', strings.nameLabel.en, strings.nameLabel.te)}
                {th('mobileNumber', strings.mobileNumberLabel.en, strings.mobileNumberLabel.te)}
                {th('label', strings.memberAccessColumn.en, strings.memberAccessColumn.te)}
                {th('until', strings.memberUntilColumn.en, strings.memberUntilColumn.te)}
                {th('createdAt', strings.memberJoinedColumn.en, strings.memberJoinedColumn.te)}
                <th>
                  {strings.memberActionsColumn.en} / {strings.memberActionsColumn.te}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => {
                const until = accessUntil(m);
                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.userCode}</strong>
                    </td>
                    <td>{m.name}</td>
                    <td>{m.mobileNumber}</td>
                    <td>
                      {strings[LABEL_KEYS[m.label]].en} / {strings[LABEL_KEYS[m.label]].te}
                      {m.label === 'FREE' && m.freeNote ? ` — ${m.freeNote}` : ''}
                    </td>
                    <td>{until ? new Date(until).toLocaleDateString() : '—'}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button type="button" className="secondary" onClick={() => setGrantFor(m)} disabled={busyId === m.id}>
                        {m.freeUntil && new Date(m.freeUntil) > new Date() ? <Bi id="memberChangeFreeButton" /> : <Bi id="memberGrantFreeButton" />}
                      </button>{' '}
                      {m.freeUntil && new Date(m.freeUntil) > new Date() && (
                        <button type="button" className="secondary" onClick={() => handleRevoke(m)} disabled={busyId === m.id}>
                          <Bi id="memberRevokeFreeButton" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/admin" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
