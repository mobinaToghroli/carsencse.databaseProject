import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import UserHistory from './pages/UserHistory';
import NewRequest from './pages/NewRequest';
import UserProfile from './pages/UserProfile';
import UserVehicles from './pages/UserVehicles';
import MechanicDashboard from './pages/MechanicDashboard';
import MechanicRequests from './pages/MechanicRequests';
import MechanicProfile from './pages/MechanicProfile';
import ServiceHistory from './pages/ServiceHistory';
import MechanicsList from './pages/MechanicsList';
import MechanicPublicProfile from './pages/MechanicPublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import AdminMechanics from './pages/AdminMechanics';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';

['carsense_state', 'carsense_v2_state', 'carsense_v3_state'].forEach((k) => localStorage.removeItem(k));

function AdminRoute() {
  const { currentUser } = useApp();
  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute requiredRole="admin"><AdminRequests /></ProtectedRoute>} />
          <Route path="/admin/mechanics" element={<ProtectedRoute requiredRole="admin"><AdminMechanics /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/mechanics" element={<MechanicsList />} />
          <Route path="/mechanics/:id" element={<MechanicPublicProfile />} />

          <Route path="/user/history" element={<ProtectedRoute requiredRole="user"><UserHistory /></ProtectedRoute>} />
          <Route path="/user/new-request" element={<ProtectedRoute requiredRole="user"><NewRequest /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute requiredRole="user"><UserProfile /></ProtectedRoute>} />
          <Route path="/user/vehicles" element={<ProtectedRoute requiredRole="user"><UserVehicles /></ProtectedRoute>} />

          <Route path="/mechanic/dashboard" element={<ProtectedRoute requiredRole="mechanic"><MechanicDashboard /></ProtectedRoute>} />
          <Route path="/mechanic/requests" element={<ProtectedRoute requiredRole="mechanic"><MechanicRequests /></ProtectedRoute>} />
          <Route path="/mechanic/profile" element={<ProtectedRoute requiredRole="mechanic"><MechanicProfile /></ProtectedRoute>} />
          <Route path="/mechanic/history" element={<ProtectedRoute requiredRole="mechanic"><ServiceHistory /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
