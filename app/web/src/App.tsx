import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import { NoPortalPage } from './pages/NoPortalPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
