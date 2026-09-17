import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { ROUTES } from '../routes';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: Role[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink-primary">This area is for property owners</h1>
        <p className="mt-3 text-sm text-ink-secondary">
          Your account role ("{user.role}") doesn't have access to this page.
        </p>
        <Link to={ROUTES.home} className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
