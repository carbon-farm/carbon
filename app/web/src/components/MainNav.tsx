import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CLOSE_NAV_EVENT, NAV, OPEN_NAV_EVENT, isGroup, type NavEntry, type NavLinkItem } from './navConfig';
import { Bi } from '../i18n/Bi';
import { strings } from '../i18n/strings';

const label = (item: { labelKey: NavLinkItem['labelKey'] }) => `${strings[item.labelKey].en} / ${strings[item.labelKey].te}`;

// The menu under the title bar. Every link is always reachable without sideways scrolling:
//  - laptop/desktop: a bar of links and grouped dropdowns (click a group to open it);
//  - phone/tablet: a "Menu" button that opens a full-width panel listing every group with its
//    links underneath, large enough to tap.
// The same markup serves both (CSS decides), so the guided tour can find every link.
export function MainNav({ role }: { role: string }) {
  const entries: NavEntry[] = NAV[role] ?? [];
  const { pathname } = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const [navBottom, setNavBottom] = useState(60);

  const flat = useMemo(() => entries.flatMap((e) => (isGroup(e) ? e.items : [e])), [entries]);

  // The current page's link: the longest match, so /marketplace/cart lights up "Cart",
  // not "Marketplace" too.
  const activeTo = useMemo(
    () =>
      flat
        .filter((i) => (i.to === '/admin' ? pathname === '/admin' : pathname === i.to || pathname.startsWith(`${i.to}/`)))
        .sort((a, b) => b.to.length - a.to.length)[0]?.to,
    [flat, pathname],
  );
  const activeItem = flat.find((i) => i.to === activeTo);

  // On a phone the opened menu is pinned just under the menu bar and fills the rest of the
  // screen (scrolling inside itself), so nothing can hang off the bottom. The page behind it
  // is held still while it is open.
  useLayoutEffect(() => {
    if (!drawerOpen || window.innerWidth > 860) return;
    if (rootRef.current) setNavBottom(Math.max(0, rootRef.current.getBoundingClientRect().bottom));
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const closeAll = useCallback(() => {
    setOpenGroup(null);
    setDrawerOpen(false);
  }, []);

  // Close whenever the page changes.
  useEffect(closeAll, [pathname, closeAll]);

  // Close on a click elsewhere or Esc — but not while the guided tour is driving the menu.
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (document.body.classList.contains('tour-on')) return;
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.body.classList.contains('tour-on')) closeAll();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [closeAll]);

  // The guided tour asks for the menu holding a link to be opened before it points at it.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const target = (e as CustomEvent<string>).detail;
      const group = entries.find((en) => isGroup(en) && en.items.some((i) => i.to === target));
      setDrawerOpen(true);
      setOpenGroup(group && isGroup(group) ? group.id : null);
    };
    window.addEventListener(OPEN_NAV_EVENT, onOpen);
    window.addEventListener(CLOSE_NAV_EVENT, closeAll);
    return () => {
      window.removeEventListener(OPEN_NAV_EVENT, onOpen);
      window.removeEventListener(CLOSE_NAV_EVENT, closeAll);
    };
  }, [entries, closeAll]);

  if (entries.length === 0) return null;

  const linkClass = (to: string) => `nav-pill${to === activeTo ? ' active' : ''}`;

  return (
    <nav
      className={`main-nav${drawerOpen ? ' drawer-open' : ''}`}
      ref={rootRef}
      aria-label="Main"
      style={{ '--nav-bottom': `${navBottom}px` } as CSSProperties}
    >
      <div className="nav-bar">
        <button
          type="button"
          className="nav-menu-btn"
          aria-expanded={drawerOpen}
          aria-controls="main-nav-list"
          onClick={() => {
            setDrawerOpen(!drawerOpen);
            setOpenGroup(null);
          }}
        >
          <span aria-hidden="true">{drawerOpen ? '✕' : '☰'}</span> <Bi id="navMenuButton" />
        </button>
        {activeItem && <span className="nav-current">{label(activeItem)}</span>}

        <ul className="nav-list" id="main-nav-list">
          {entries.map((entry) =>
            isGroup(entry) ? (
              <li key={entry.id} className={`nav-item nav-group${openGroup === entry.id ? ' open' : ''}${entry.items.some((i) => i.to === activeTo) ? ' has-active' : ''}`}>
                <button
                  type="button"
                  className="nav-pill nav-group-btn"
                  aria-expanded={openGroup === entry.id}
                  aria-haspopup="true"
                  onClick={() => setOpenGroup(openGroup === entry.id ? null : entry.id)}
                >
                  {label(entry)}
                </button>
                <ul className="nav-panel">
                  {entry.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} data-tour={item.to} className={linkClass(item.to)} aria-current={item.to === activeTo ? 'page' : undefined}>
                        {label(item)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={entry.to} className="nav-item">
                <Link to={entry.to} data-tour={entry.to} className={linkClass(entry.to)} aria-current={entry.to === activeTo ? 'page' : undefined}>
                  {label(entry)}
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    </nav>
  );
}
