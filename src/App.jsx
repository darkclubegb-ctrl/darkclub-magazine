import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MagazineProvider } from './context/MagazineContext';
import AgeGate from './components/AgeGate';
import ProtectionScript from './components/ProtectionScript';
import ProtectedRoute from './components/ProtectedRoute';

import SalesPage from './pages/SalesPage';
import LoginPage from './pages/LoginPage';
import ModelPage from './pages/ModelPage';
import AdminPage from './pages/AdminPage';
import MasterAdminPage from './pages/MasterAdminPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <MagazineProvider>
        <BrowserRouter>
          <ProtectionScript />
          <Routes>
            {/* ── Public ──────────────────────────────────── */}
            <Route path="/" element={<SalesPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Magazine pages — public, age-gated */}
            <Route path="/modelo/:slug" element={
              <AgeGate><ModelPage /></AgeGate>
            } />

            {/* ── Edição Zero — Demo oficial da plataforma ── */}
            <Route path="/edicao-zero" element={
              <AgeGate><ModelPage demoSlug="sofia-laurent" /></AgeGate>
            } />
            <Route path="/preview-editorial" element={
              <AgeGate><ModelPage demoSlug="sofia-laurent" /></AgeGate>
            } />

            {/* Legacy route — must be LAST to not catch /edicao-zero */}
            <Route path="/:slug" element={
              <AgeGate><ModelPage /></AgeGate>
            } />

            {/* ── Protected: Admin ────────────────────────── */}
            <Route path="/master-admin" element={
              <ProtectedRoute role="admin"><MasterAdminPage /></ProtectedRoute>
            } />
            <Route path="/admin/edit" element={
              <ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>
            } />

            {/* ── Protected: Modelo ───────────────────────── */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="modelo"><DashboardPage /></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </MagazineProvider>
    </AuthProvider>
  );
}
