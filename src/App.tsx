import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { NewApplication } from './pages/NewApplication';
import { AdminDashboard } from './pages/AdminDashboard';
import { CountryManagement } from './pages/admin/CountryManagement';
import { VisaTypeManagement } from './pages/admin/VisaTypeManagement';
import { ApplicationDetail } from './pages/admin/ApplicationDetail';

function Router() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && route !== '/signup') {
    return <SignIn />;
  }

  if (!user && route === '/signup') {
    return <SignUp />;
  }

  if (route === '/signin') {
    window.location.href = '/';
    return null;
  }

  if (route === '/signup') {
    return <SignUp />;
  }

  if (route === '/new-application') {
    return <NewApplication />;
  }

  if (route === '/admin/countries') {
    return <CountryManagement />;
  }

  if (route === '/admin/visa-types') {
    return <VisaTypeManagement />;
  }

  if (route.startsWith('/admin/application/')) {
    return <ApplicationDetail />;
  }

  if (route === '/admin' || route.startsWith('/admin/')) {
    return <AdminDashboard />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router />
      </LanguageProvider>
    </AuthProvider>
  );
}
