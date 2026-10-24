import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { MembershipProvider } from './auth/MembershipContext';
import { OpenRoute, ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CasesPage = lazy(() => import('./pages/CasesPage').then((m) => ({ default: m.CasesPage })));
const NewCasePage = lazy(() => import('./pages/NewCasePage').then((m) => ({ default: m.NewCasePage })));
const CaseDetailPage = lazy(() => import('./pages/CaseDetailPage').then((m) => ({ default: m.CaseDetailPage })));
const ModeratorQueuePage = lazy(() => import('./pages/ModeratorQueuePage').then((m) => ({ default: m.ModeratorQueuePage })));
const ExpertCasesPage = lazy(() => import('./pages/ExpertCasesPage').then((m) => ({ default: m.ExpertCasesPage })));
const ExpertCredentialsPage = lazy(() => import('./pages/ExpertCredentialsPage').then((m) => ({ default: m.ExpertCredentialsPage })));
const ExpertCaseDetailPage = lazy(() => import('./pages/ExpertCaseDetailPage').then((m) => ({ default: m.ExpertCaseDetailPage })));
const AdminHomePage = lazy(() => import('./pages/AdminHomePage').then((m) => ({ default: m.AdminHomePage })));
const AdminStaffPage = lazy(() => import('./pages/AdminStaffPage').then((m) => ({ default: m.AdminStaffPage })));
const AdminCredentialsPage = lazy(() => import('./pages/AdminCredentialsPage').then((m) => ({ default: m.AdminCredentialsPage })));
const AdminTaxonomyPage = lazy(() => import('./pages/AdminTaxonomyPage').then((m) => ({ default: m.AdminTaxonomyPage })));
const AdminAuditPage = lazy(() => import('./pages/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })));
const AdminReportingPage = lazy(() => import('./pages/AdminReportingPage').then((m) => ({ default: m.AdminReportingPage })));
const ExpertArticlesPage = lazy(() => import('./pages/ExpertArticlesPage').then((m) => ({ default: m.ExpertArticlesPage })));
const ArticleEditPage = lazy(() => import('./pages/ArticleEditPage').then((m) => ({ default: m.ArticleEditPage })));
const ModeratorArticlesPage = lazy(() => import('./pages/ModeratorArticlesPage').then((m) => ({ default: m.ModeratorArticlesPage })));
const KnowledgeBrowsePage = lazy(() => import('./pages/KnowledgeBrowsePage').then((m) => ({ default: m.KnowledgeBrowsePage })));
const ArticleViewPage = lazy(() => import('./pages/ArticleViewPage').then((m) => ({ default: m.ArticleViewPage })));
const NoPortalPage = lazy(() => import('./pages/NoPortalPage').then((m) => ({ default: m.NoPortalPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const CoursesBrowsePage = lazy(() => import('./pages/CoursesBrowsePage').then((m) => ({ default: m.CoursesBrowsePage })));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const LessonViewPage = lazy(() => import('./pages/LessonViewPage').then((m) => ({ default: m.LessonViewPage })));
const CoursesManagePage = lazy(() => import('./pages/CoursesManagePage').then((m) => ({ default: m.CoursesManagePage })));
const CourseEditPage = lazy(() => import('./pages/CourseEditPage').then((m) => ({ default: m.CourseEditPage })));
const SoilSamplesPage = lazy(() => import('./pages/SoilSamplesPage').then((m) => ({ default: m.SoilSamplesPage })));
const SoilSampleDetailPage = lazy(() => import('./pages/SoilSampleDetailPage').then((m) => ({ default: m.SoilSampleDetailPage })));
const SoilLabQueuePage = lazy(() => import('./pages/SoilLabQueuePage').then((m) => ({ default: m.SoilLabQueuePage })));
import { MarketplacePage } from './pages/MarketplacePage';
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const AddressesPage = lazy(() => import('./pages/AddressesPage').then((m) => ({ default: m.AddressesPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })));
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage').then((m) => ({ default: m.VendorDashboardPage })));
const ProductEditPage = lazy(() => import('./pages/ProductEditPage').then((m) => ({ default: m.ProductEditPage })));
const VendorApprovalsPage = lazy(() => import('./pages/VendorApprovalsPage').then((m) => ({ default: m.VendorApprovalsPage })));
const ProductsManagePage = lazy(() => import('./pages/ProductsManagePage').then((m) => ({ default: m.ProductsManagePage })));
const OrdersManagePage = lazy(() => import('./pages/OrdersManagePage').then((m) => ({ default: m.OrdersManagePage })));
const HariharaaLandingPage = lazy(() => import('./pages/hariharaa/HariharaaLandingPage').then((m) => ({ default: m.HariharaaLandingPage })));
const HariharaaSubscriptionPage = lazy(() => import('./pages/hariharaa/HariharaaSubscriptionPage').then((m) => ({ default: m.HariharaaSubscriptionPage })));
const AdminHariharaaSubscriptionsPage = lazy(() => import('./pages/hariharaa/AdminHariharaaSubscriptionsPage').then((m) => ({ default: m.AdminHariharaaSubscriptionsPage })));
const AdminMembersPage = lazy(() => import('./pages/hariharaa/AdminMembersPage').then((m) => ({ default: m.AdminMembersPage })));
const AdminMembershipPlansPage = lazy(() => import('./pages/hariharaa/AdminMembershipPlansPage').then((m) => ({ default: m.AdminMembershipPlansPage })));
const OrderReceiptPage = lazy(() => import('./pages/OrderReceiptPage').then((m) => ({ default: m.OrderReceiptPage })));
const AdminSeasonalTipsPage = lazy(() => import('./pages/AdminSeasonalTipsPage').then((m) => ({ default: m.AdminSeasonalTipsPage })));
const AdminUsagePage = lazy(() => import('./pages/AdminUsagePage').then((m) => ({ default: m.AdminUsagePage })));
const AdminHariharaaSettingsPage = lazy(() => import('./pages/hariharaa/AdminHariharaaSettingsPage').then((m) => ({ default: m.AdminHariharaaSettingsPage })));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })));
const MediaLibraryPage = lazy(() => import('./pages/MediaLibraryPage').then((m) => ({ default: m.MediaLibraryPage })));
const DispatchQueuePage = lazy(() => import('./pages/hariharaa/DispatchQueuePage').then((m) => ({ default: m.DispatchQueuePage })));
const HelpChat = lazy(() => import('./components/HelpChat').then((m) => ({ default: m.HelpChat })));
import { strings } from './i18n/strings';
import { ErrorBoundary } from './telemetry/ErrorBoundary';
import { PageTracker } from './telemetry/PageTracker';

// Every screen except the first ones a visitor sees is fetched only when it is opened, so a phone
// on a slow connection downloads the shop and log in first and the rest on demand.
function RouteFallback() {
  return (
    <div className="screen">
      <p className="hint route-loading" role="status">
        {strings.loading.en} / {strings.loading.te}
      </p>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MembershipProvider>
        <PageTracker />
        <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/hariharaa" element={<HariharaaLandingPage />} />
          <Route
            path="/help"
            element={
              <OpenRoute>
                <HelpPage />
              </OpenRoute>
            }
          />
          {/* One account type: the old HARIHARAA sign-up and shop addresses lead to the shared ones. */}
          <Route path="/hariharaa/register" element={<Navigate to="/register" replace />} />
          <Route path="/hariharaa/shop" element={<Navigate to="/marketplace" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['MEMBER']} membership>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute roles={['MEMBER']} membership>
                <CasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/new"
            element={
              <ProtectedRoute roles={['MEMBER']} membership>
                <NewCasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute roles={['MEMBER']} membership>
                <CaseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/moderator/queue"
            element={
              <ProtectedRoute roles={['MODERATOR']}>
                <ModeratorQueuePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expert/cases"
            element={
              <ProtectedRoute roles={['EXPERT']}>
                <ExpertCasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/credentials"
            element={
              <ProtectedRoute roles={['EXPERT']}>
                <ExpertCredentialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/cases/:id"
            element={
              <ProtectedRoute roles={['EXPERT']}>
                <ExpertCaseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expert/articles"
            element={
              <ProtectedRoute roles={['EXPERT']}>
                <ExpertArticlesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/articles/:id"
            element={
              <ProtectedRoute roles={['EXPERT']}>
                <ArticleEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/moderator/articles"
            element={
              <ProtectedRoute roles={['MODERATOR']}>
                <ModeratorArticlesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/knowledge"
            element={
              <ProtectedRoute membership>
                <KnowledgeBrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge/:id"
            element={
              <ProtectedRoute membership>
                <ArticleViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminStaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/credentials"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminCredentialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/taxonomy"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminTaxonomyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']} wide>
                <AdminAuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/seasonal"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR', 'MODERATOR']}>
                <AdminSeasonalTipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usage"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminUsagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminReportingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute membership>
                <CoursesBrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/manage"
            element={
              <ProtectedRoute roles={['MODERATOR', 'ADMINISTRATOR']}>
                <CoursesManagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/manage/:id"
            element={
              <ProtectedRoute roles={['MODERATOR', 'ADMINISTRATOR']}>
                <CourseEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute membership>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/lessons/:lessonId"
            element={
              <ProtectedRoute membership>
                <LessonViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/soil-samples"
            element={
              <ProtectedRoute roles={['MEMBER']} membership>
                <SoilSamplesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/soil-samples/manage"
            element={
              <ProtectedRoute roles={['MODERATOR', 'ADMINISTRATOR']}>
                <SoilLabQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/soil-samples/:id"
            element={
              <ProtectedRoute membership>
                <SoilSampleDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <OpenRoute>
                <MarketplacePage />
              </OpenRoute>
            }
          />
          <Route
            path="/marketplace/products/:id"
            element={
              <OpenRoute>
                <ProductDetailPage />
              </OpenRoute>
            }
          />
          <Route
            path="/marketplace/cart"
            element={
              <OpenRoute>
                <CartPage />
              </OpenRoute>
            }
          />
          <Route
            path="/marketplace/checkout"
            element={
              <ProtectedRoute roles={['MEMBER']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/addresses"
            element={
              <ProtectedRoute roles={['MEMBER']}>
                <AddressesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/orders"
            element={
              <ProtectedRoute roles={['MEMBER']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/orders/:id/receipt"
            element={
              <ProtectedRoute>
                <OrderReceiptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/vendor"
            element={
              <ProtectedRoute roles={['VENDOR']}>
                <VendorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/manage/products"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <ProductsManagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/manage/products/:id"
            element={
              <ProtectedRoute roles={['VENDOR', 'ADMINISTRATOR']}>
                <ProductEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/manage/vendors"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <VendorApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/manage/orders"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <OrdersManagePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hariharaa/subscription"
            element={
              <ProtectedRoute roles={['MEMBER']}>
                <HariharaaSubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/membership-plans"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminMembershipPlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']} wide>
                <AdminMembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hariharaa-subscriptions"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminHariharaaSubscriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hariharaa-settings"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR']}>
                <AdminHariharaaSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/dispatch-queue"
            element={
              <ProtectedRoute roles={['SUPPORT_AGENT']}>
                <DispatchQueuePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/media"
            element={
              <ProtectedRoute roles={['ADMINISTRATOR', 'MODERATOR']}>
                <MediaLibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/no-portal"
            element={
              <ProtectedRoute>
                <NoPortalPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
        </ErrorBoundary>
        {/* The help assistant: one round button on every screen, including log in and register. */}
        <Suspense fallback={null}>
          <HelpChat />
        </Suspense>
        </MembershipProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
