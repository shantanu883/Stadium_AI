import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AIAssistant } from './pages/AIAssistant';
import { Navigation } from './pages/Navigation';
import { Transport } from './pages/Transport';
import { Reports } from './pages/Reports';
import { CrowdMonitor } from './pages/CrowdMonitor';
import { Sustainability } from './pages/Sustainability';
import { Admin } from './pages/Admin';

// Role Guard Component
interface RoleGuardProps {
  allowedRoles: Array<'fan' | 'volunteer' | 'staff' | 'admin'>;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-fifa-dark flex items-center justify-center text-fifa-accent font-bold text-sm tracking-wider font-mono">
        ⌛ VERIFYING CREDENTIAL GRID ACCESS...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

// Common Layout with Sidebar
const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-fifa-dark flex items-center justify-center text-fifa-accent font-bold text-sm tracking-wider font-mono">
        ⌛ INITIALIZING COCKPIT MAINBOARD...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-fifa-dark">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar />
      
      {/* Scrollable Main Content Frame */}
      <main className="lg:pl-72 pt-16 lg:pt-0 transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Root Router Component
const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />

      {/* Protected Dashboard Layout Routes */}
      <Route element={<DashboardLayout />}>
        {/* Universal Access pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/navigation" element={<Navigation />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/reports" element={<Reports />} />

        {/* Fan Role guarded pages */}
        <Route element={<RoleGuard allowedRoles={['fan']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Crew Staff/Admin guarded pages */}
        <Route element={<RoleGuard allowedRoles={['staff', 'admin']} />}>
          <Route path="/crowd-monitor" element={<CrowdMonitor />} />
          <Route path="/sustainability" element={<Sustainability />} />
        </Route>

        {/* Admin only Command Center */}
        <Route element={<RoleGuard allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      {/* Redirect wildcards */}
      <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
