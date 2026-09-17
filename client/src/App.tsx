import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from './components/ui/Tooltip';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ComparePage from './pages/ComparePage';
import ProfilePage from './pages/ProfilePage';
import SavedPage from './pages/SavedPage';
import { RequireAuth } from './components/RequireAuth';
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerPropertiesPage from './pages/owner/OwnerPropertiesPage';
import OwnerPropertyFormPage from './pages/owner/OwnerPropertyFormPage';
import OwnerInquiriesPage from './pages/owner/OwnerInquiriesPage';
import { ROUTES } from './routes';

const NotFoundPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 text-center">
    <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-semibold">404</p>
    <h1 className="mt-4 text-3xl font-bold text-ink-primary">Page not found</h1>
    <p className="mt-3 text-sm text-ink-secondary">The page you’re looking for doesn’t exist or has moved.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-surface-bg text-ink-primary">
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: { fontFamily: 'Inter, system-ui, sans-serif' },
          }}
        />
        <Navbar />
        <main className="min-h-[calc(100vh-160px)]">
          <Routes>
            <Route path={ROUTES.home} element={<LandingPage />} />
            <Route path={ROUTES.explore} element={<ExplorePage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<RegisterPage />} />
            <Route path={ROUTES.compare} element={<ComparePage />} />
            <Route
              path={ROUTES.saved}
              element={
                <RequireAuth>
                  <SavedPage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.profile}
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.owner}
              element={
                <RequireAuth roles={['owner', 'admin']}>
                  <OwnerLayout />
                </RequireAuth>
              }
            >
              <Route index element={<OwnerDashboardPage />} />
              <Route path="properties" element={<OwnerPropertiesPage />} />
              <Route path="properties/new" element={<OwnerPropertyFormPage />} />
              <Route path="properties/:id" element={<OwnerPropertyFormPage />} />
              <Route path="inquiries" element={<OwnerInquiriesPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default App;
