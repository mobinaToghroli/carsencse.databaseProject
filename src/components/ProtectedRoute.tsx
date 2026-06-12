import { Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ReactNode } from 'react';

export function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: 'user' | 'mechanic' | 'admin' }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRole && currentUser.role !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}
