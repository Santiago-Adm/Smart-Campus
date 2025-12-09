import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DocumentsPage from '@/pages/documents/DocumentsPage';
import UploadDocumentPage from '@/pages/documents/UploadDocumentPage';
import DocumentDetailPage from '@/pages/documents/DocumentDetailPage';

// Library Pages
import LibraryPage from '@/pages/library/LibraryPage';
import ResourceDetailPage from '@/pages/library/ResourceDetailPage';
import UploadResourcePage from '@/pages/library/UploadResourcePage';

// Simulations Pages
import SimulationsPage from '@/pages/simulations/SimulationsPage';
import ScenarioDetailPage from '@/pages/simulations/ScenarioDetailPage';
import CreateScenarioPage from '@/pages/simulations/CreateScenarioPage';
import EditScenarioPage from '@/pages/simulations/EditScenarioPage';
import ExecuteSimulationPage from '@/pages/simulations/ExecuteSimulationPage';

// Telehealth Pages
import TelehealthPage from '@/pages/telehealth/TelehealthPage';
import ScheduleAppointmentPage from '@/pages/telehealth/ScheduleAppointmentPage';
import AppointmentDetailPage from '@/pages/telehealth/AppointmentDetailPage';
import VideoCallPage from '@/pages/telehealth/VideoCallPage';

// ✅ NUEVO: Analytics
//import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
//import ReportsPage from './pages/analytics/ReportsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Role Protected Route Component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasAllowedRole = user?.roles?.some((role) => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Documents Routes */}
        <Route path="documents" element={<DocumentsPage />} />

        {/* Upload para ESTUDIANTES, ADMINISTRATIVE e IT_ADMIN */}
        <Route
          path="documents/upload"
          element={
            <RoleProtectedRoute allowedRoles={['STUDENT', 'ADMINISTRATIVE', 'IT_ADMIN']}>
              <UploadDocumentPage />
            </RoleProtectedRoute>
          }
        />

        <Route path="documents/:id" element={<DocumentDetailPage />} />

        {/* Library Routes */}
        <Route path="library" element={<LibraryPage />} />
        <Route path="library/:id" element={<ResourceDetailPage />} />
        <Route
          path="library/upload"
          element={
            <RoleProtectedRoute allowedRoles={['TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN']}>
              <UploadResourcePage />
            </RoleProtectedRoute>
          }
        />

        {/* Simulations Routes */}
        <Route path="simulations" element={<SimulationsPage />} />
        <Route path="simulations/:id" element={<ScenarioDetailPage />} />
        <Route
          path="simulations/create"
          element={
            <RoleProtectedRoute allowedRoles={['TEACHER', 'ADMIN', 'IT_ADMIN']}>
              <CreateScenarioPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="simulations/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={['TEACHER', 'ADMIN', 'IT_ADMIN']}>
              <EditScenarioPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="simulations/:id/execute" element={<ExecuteSimulationPage />} />

        {/* NUEVO: Telehealth Routes */}
        {/* Telehealth - Dashboard principal (todos los usuarios autenticados) */}
        <Route path="telehealth" element={<TelehealthPage />} />

        {/* Agendar cita - Todos los usuarios pueden agendar */}
        <Route path="telehealth/schedule" element={<ScheduleAppointmentPage />} />

        {/* Detalles de cita - Todos los usuarios pueden ver sus citas */}
        <Route path="telehealth/appointments/:id" element={<AppointmentDetailPage />} />

        {/* Videollamada - Todos los usuarios pueden participar */}
        <Route path="telehealth/video/:id" element={<VideoCallPage />} />

        {/* NUEVO: Analytics Routes
        <Route
          path="analytics"
          element={<AnalyticsDashboard />}
        />

        <Route
          path="analytics/reports"
          element={
            <RoleProtectedRoute allowedRoles={['TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR']}>
              <ReportsPage />
            </RoleProtectedRoute>
          }
        />
        */}

        {/* Agregar más rutas aquí */}
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
