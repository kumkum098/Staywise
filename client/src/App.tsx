import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
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
    <div className="min-h-screen bg-surface-bg text-ink-primary">
      <Navbar />
      <main className="min-h-[calc(100vh-160px)]">
        <Routes>
          <Route path={ROUTES.home} element={<LandingPage />} />
          <Route path={ROUTES.explore} element={<ExplorePage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
