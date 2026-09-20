import type { StringKey } from '../i18n/strings';

export interface NavLinkItem {
  to: string;
  labelKey: StringKey;
}

// A dropdown on a laptop, a heading with its links on a phone.
export interface NavGroup {
  id: string;
  labelKey: StringKey;
  items: NavLinkItem[];
}

export type NavEntry = NavLinkItem | NavGroup;

export const isGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

// The menu for each kind of signed-in user (and for visitors). Roles with only a handful of
// links keep them flat; the rest are grouped so the whole menu always fits on screen.
// The `to` values are also what the guided tour points at (tour/steps.ts).
export const NAV: Record<string, NavEntry[]> = {
  MEMBER: [
    {
      id: 'shop',
      labelKey: 'navGroupShop',
      items: [
        { to: '/marketplace', labelKey: 'marketplaceEyebrow' },
        { to: '/marketplace/cart', labelKey: 'cartTitle' },
        { to: '/marketplace/orders', labelKey: 'myOrdersTitle' },
        { to: '/account/addresses', labelKey: 'addressesNavTitle' },
      ],
    },
    {
      id: 'farm',
      labelKey: 'navGroupFarm',
      items: [
        { to: '/dashboard', labelKey: 'dashboardEyebrow' },
        { to: '/cases', labelKey: 'myCasesTitle' },
        { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
        { to: '/courses', labelKey: 'coursesEyebrow' },
        { to: '/soil-samples', labelKey: 'soilSamplesEyebrow' },
      ],
    },
    { to: '/hariharaa/subscription', labelKey: 'hariharaaSubscriptionNavTitle' },
  ],
  MODERATOR: [
    {
      id: 'review',
      labelKey: 'navGroupReview',
      items: [
        { to: '/moderator/queue', labelKey: 'moderatorQueueTitle' },
        { to: '/moderator/articles', labelKey: 'articleQueueTitle' },
        { to: '/soil-samples/manage', labelKey: 'sampleQueueTitle' },
      ],
    },
    {
      id: 'content',
      labelKey: 'navGroupContent',
      items: [
        { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
        { to: '/courses/manage', labelKey: 'coursesManageTitle' },
        { to: '/admin/media', labelKey: 'mediaNavTitle' },
      ],
    },
  ],
  EXPERT: [
    { to: '/expert/cases', labelKey: 'expertCasesTitle' },
    { to: '/expert/articles', labelKey: 'myArticlesTitle' },
    { to: '/expert/credentials', labelKey: 'myCredentialsLinkTitle' },
    { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
  ],
  VENDOR: [
    { to: '/marketplace/vendor', labelKey: 'vendorDashboardTitle' },
    { to: '/marketplace', labelKey: 'marketplaceEyebrow' },
  ],
  ADMINISTRATOR: [
    { to: '/admin', labelKey: 'adminHubTitle' },
    {
      id: 'people',
      labelKey: 'navGroupPeople',
      items: [
        { to: '/admin/staff', labelKey: 'staffLinkTitle' },
        { to: '/admin/members', labelKey: 'membersAdminNavTitle' },
        { to: '/admin/credentials', labelKey: 'credentialsLinkTitle' },
      ],
    },
    {
      id: 'shop',
      labelKey: 'navGroupShop',
      items: [
        { to: '/marketplace/manage/orders', labelKey: 'ordersQueueTitle' },
        { to: '/marketplace/manage/products', labelKey: 'productsManageTitle' },
        { to: '/marketplace/manage/vendors', labelKey: 'vendorApprovalsTitle' },
      ],
    },
    {
      id: 'membership',
      labelKey: 'navGroupMembership',
      items: [
        { to: '/admin/hariharaa-subscriptions', labelKey: 'hariharaaSubscriptionsAdminNavTitle' },
        { to: '/admin/membership-plans', labelKey: 'plansAdminNavTitle' },
        { to: '/admin/hariharaa-settings', labelKey: 'hariharaaSettingsAdminNavTitle' },
      ],
    },
    {
      id: 'content',
      labelKey: 'navGroupContent',
      items: [
        { to: '/knowledge', labelKey: 'knowledgeEyebrow' },
        { to: '/courses/manage', labelKey: 'coursesManageTitle' },
        { to: '/soil-samples/manage', labelKey: 'sampleQueueTitle' },
        { to: '/admin/media', labelKey: 'mediaNavTitle' },
      ],
    },
    {
      id: 'insights',
      labelKey: 'navGroupInsights',
      items: [
        { to: '/admin/reports', labelKey: 'reportsLinkTitle' },
        { to: '/admin/audit', labelKey: 'auditLogLinkTitle' },
        { to: '/admin/taxonomy', labelKey: 'taxonomyLinkTitle' },
      ],
    },
  ],
  SUPPORT_AGENT: [{ to: '/support/dispatch-queue', labelKey: 'dispatchQueueNavTitle' }],
  // Visitors who are not signed in: the shop window and their cart.
  GUEST: [
    { to: '/marketplace', labelKey: 'marketplaceEyebrow' },
    { to: '/marketplace/cart', labelKey: 'cartTitle' },
  ],
};

export const OPEN_NAV_EVENT = 'agriai:open-nav';
export const CLOSE_NAV_EVENT = 'agriai:close-nav';
