import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { NewCasePage } from './pages/NewCasePage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ModeratorQueuePage } from './pages/ModeratorQueuePage';
import { ExpertCasesPage } from './pages/ExpertCasesPage';
import { ExpertCaseDetailPage } from './pages/ExpertCaseDetailPage';
import { AdminHomePage } from './pages/AdminHomePage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminCredentialsPage } from './pages/AdminCredentialsPage';
import { AdminTaxonomyPage } from './pages/AdminTaxonomyPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminReportingPage } from './pages/AdminReportingPage';
import { ExpertArticlesPage } from './pages/ExpertArticlesPage';
import { ArticleEditPage } from './pages/ArticleEditPage';
import { ModeratorArticlesPage } from './pages/ModeratorArticlesPage';
import { KnowledgeBrowsePage } from './pages/KnowledgeBrowsePage';
import { ArticleViewPage } from './pages/ArticleViewPage';
import { NoPortalPage } from './pages/NoPortalPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CoursesBrowsePage } from './pages/CoursesBrowsePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonViewPage } from './pages/LessonViewPage';
import { CoursesManagePage } from './pages/CoursesManagePage';
import { CourseEditPage } from './pages/CourseEditPage';
import { SoilSamplesPage } from './pages/SoilSamplesPage';
import { SoilSampleDetailPage } from './pages/SoilSampleDetailPage';
import { SoilLabQueuePage } from './pages/SoilLabQueuePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { ProductEditPage } from './pages/ProductEditPage';
import { VendorApprovalsPage } from './pages/VendorApprovalsPage';
import { ProductsManagePage } from './pages/ProductsManagePage';
import { OrdersManagePage } from './pages/OrdersManagePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['FARMER']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute roles={['FARMER']}>
                <CasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/new"
            element={
              <ProtectedRoute roles={['FARMER']}>
                <NewCasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute roles={['FARMER']}>
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
              <ProtectedRoute>
                <KnowledgeBrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge/:id"
            element={
              <ProtectedRoute>
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
              <ProtectedRoute>
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
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <LessonViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/soil-samples"
            element={
              <ProtectedRoute roles={['FARMER']}>
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
              <ProtectedRoute>
                <SoilSampleDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/cart"
            element={
              <ProtectedRoute roles={['FARMER']}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/orders"
            element={
              <ProtectedRoute roles={['FARMER']}>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
