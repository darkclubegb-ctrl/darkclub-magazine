import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — role-based route guard.
 * 
 * Usage:
 *   <Route path="/master-admin" element={<ProtectedRoute role="admin"><MasterAdminPage /></ProtectedRoute>} />
 *   <Route path="/dashboard" element={<ProtectedRoute role="modelo"><DashboardPage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, role }) {
    const { user, role: userRole, loading, isConfigured } = useAuth();

    // While loading auth state, show nothing (prevents flash)
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <p className="font-body uppercase text-black/20" style={{ fontSize: '8px', letterSpacing: '0.5em' }}>
                    Verificando acesso...
                </p>
            </div>
        );
    }

    // If Supabase not configured, allow access (dev mode)
    if (!isConfigured) return children;

    // Not authenticated → login
    if (!user) return <Navigate to="/login" replace />;

    // MVP mode: allow any authenticated user into their route.
    // Role guard only blocks cross-role access (modelo → admin or admin → modelo).
    if (role && userRole && userRole !== role) {
        if (userRole === 'admin') return <Navigate to="/master-admin" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    // New users may not have a role yet — allow through to dashboard
    return children;
}
