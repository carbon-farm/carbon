import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useMembership } from '../auth/MembershipContext';
import { listMyOrders, type Order } from '../api/marketplace';
import { listMyCases, type Case } from '../api/cases';
import { getCurrentTips, type CurrentTip } from '../api/seasonal';
import { Bi, BiValue } from '../i18n/Bi';
import { strings, orderProgressNote, orderStatusLabel, caseStatusLabel } from '../i18n/strings';

const CLOSED: string[] = ['CLOSED', 'ABANDONED'];

// A member's "Today": the few things that need them, at the top of the shop. Each card says what
// is happening and is one tap from the screen to deal with it. Nothing here is required reading —
// it just saves a member from hunting through menus.
export function TodayPanel() {
  const { session } = useAuth();
  const { status } = useMembership();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [cases, setCases] = useState<Case[] | null>(null);
  const [tips, setTips] = useState<CurrentTip[]>([]);

  const hasAccess = status?.hasAccess ?? false;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    listMyOrders(session.accessToken)
      .then((o) => !cancelled && setOrders(o))
      .catch(() => !cancelled && setOrders([]));
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session || !hasAccess) return;
    let cancelled = false;
    listMyCases(session.accessToken)
      .then((c) => !cancelled && setCases(c))
      .catch(() => !cancelled && setCases([]));
    getCurrentTips(session.accessToken)
      .then((t) => !cancelled && setTips(t))
      .catch(() => !cancelled && setTips([]));
    return () => {
      cancelled = true;
    };
  }, [session, hasAccess]);

  if (!session) return null;

  const lastOrder = orders && orders.length > 0 ? orders[0] : null;
  const openCases = (cases ?? []).filter((c) => !CLOSED.includes(c.status));
  const answered = openCases.filter((c) => c.status === 'ANSWERED' || c.status === 'WAITING_FARMER');
  const daysLeft = status?.daysLeft ?? null;
  const membershipRequired = status?.membershipRequired ?? true;

  return (
    <section className="today-panel" aria-label={strings.todayTitle.en} data-tour="today">
      <Bi id="todayTitle" as="h2" />
      <div className="today-grid">
        {membershipRequired && status && (
          <Link to="/hariharaa/subscription" className={`today-card${!hasAccess || (daysLeft !== null && daysLeft <= 3) ? ' attention' : ''}`}>
            <Bi id="todayMembership" as="span" className="field-label" />
            {hasAccess ? (
              <strong>
                {daysLeft !== null ? `${daysLeft} ${strings.todayDaysLeft.en} / ${strings.todayDaysLeft.te}` : `${strings.todayActive.en} / ${strings.todayActive.te}`}
              </strong>
            ) : (
              <strong>
                {strings.todayNotActive.en} / {strings.todayNotActive.te}
              </strong>
            )}
            <small className="hint">
              {hasAccess ? <Bi id="todayRenewHint" /> : <Bi id="todayPayHint" />}
            </small>
          </Link>
        )}

        {hasAccess && (
          <Link to={answered.length > 0 ? `/cases/${answered[0].id}` : '/cases'} className={`today-card${answered.length > 0 ? ' attention' : ''}`}>
            <Bi id="todayCases" as="span" className="field-label" />
            <strong>
              {openCases.length === 0
                ? `${strings.todayNoOpenCases.en} / ${strings.todayNoOpenCases.te}`
                : `${openCases.length} ${strings.todayOpenCases.en} / ${strings.todayOpenCases.te}`}
            </strong>
            <small className="hint">
              {answered.length > 0 ? <BiValue value={caseStatusLabel(answered[0].status)} /> : <Bi id="todayAskExpert" />}
            </small>
          </Link>
        )}

        {lastOrder && (
          <Link to={`/marketplace/orders/${lastOrder.id}`} className="today-card">
            <Bi id="todayLastOrder" as="span" className="field-label" />
            <strong>{lastOrder.orderNumber}</strong>
            <small className="hint">
              <BiValue value={orderProgressNote(lastOrder) ?? orderStatusLabel(lastOrder.status)} />
            </small>
          </Link>
        )}

        {hasAccess && (
          <Link to="/cases/new" className="today-card">
            <Bi id="todayAskTitle" as="span" className="field-label" />
            <strong>📷 {strings.todayAskAction.en} / {strings.todayAskAction.te}</strong>
            <small className="hint">
              <Bi id="todayAskHint" />
            </small>
          </Link>
        )}
      </div>

      {tips.length > 0 && (
        <div className="today-tips">
          <Bi id="seasonalPanelTitle" as="h3" />
          {tips.map((t) => (
            <article className="today-tip" key={t.id}>
              <h4>
                <span className="bi-en">{t.titleEn}</span>
                <span className="bi-te">{t.titleTe}</span>
                {t.cropName && <span className="priority-badge">{t.cropName}</span>}
              </h4>
              <p>
                <span className="bi-en">{t.bodyEn}</span>
                <span className="bi-te">{t.bodyTe}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
