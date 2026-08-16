import { Bi } from '../i18n/Bi';

export function NoPortalPage() {
  return (
    <>
      <div>
        <Bi id="brand" as="span" className="eyebrow" />
        <Bi id="noPortalTitle" as="h1" />
      </div>
      <Bi id="noPortalNotice" as="p" className="hint" />
    </>
  );
}
