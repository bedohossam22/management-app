import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCoffee } from './context/CoffeeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import NotFoundPage from './pages/NotFoundPage';
import NotAuthorizedPage from './pages/NotAuthorizedPage';
import PrivateRoute from './components/common/PrivateRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import CoffeeBarModal from './components/coffee/CoffeeBarModal';
import BrewingOverlay from './components/coffee/BrewingOverlay';

function App() {
  const { loading, isAuthenticated } = useAuth();
  const { openCoffeeBar } = useCoffee();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, textarea or contenteditable, do not trigger
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      // 'c' or 'C' key opens coffee bar
      if (e.key === 'c' || e.key === 'C') {
        if (!e.metaKey && !e.ctrlKey && !e.altKey && isAuthenticated) {
          e.preventDefault();
          openCoffeeBar();
        }
      }
    };

    const handleOpenCustomEvent = () => {
      openCoffeeBar();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-coffee-bar', handleOpenCustomEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-coffee-bar', handleOpenCustomEvent);
    };
  }, [openCoffeeBar, isAuthenticated]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<NotAuthorizedPage />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Global Manager Coffee & Break Bar Hub */}
      <CoffeeBarModal />
      <BrewingOverlay />
    </>
  );
}

export default App;