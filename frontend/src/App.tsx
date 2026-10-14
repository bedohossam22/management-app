import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCoffee } from './context/CoffeeContext';
import { useFocus } from './context/FocusContext';
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
import FocusModal from './components/focus/FocusModal';
import FocusWidget from './components/focus/FocusWidget';
import FocusBreakPromptModal from './components/focus/FocusBreakPromptModal';

function App() {
  const { loading, isAuthenticated } = useAuth();
  const { openCoffeeBar } = useCoffee();
  const { openFocusModal } = useFocus();

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

      // 'p' or 'P' key opens focus modal
      if (e.key === 'p' || e.key === 'P') {
        if (!e.metaKey && !e.ctrlKey && !e.altKey && isAuthenticated) {
          e.preventDefault();
          openFocusModal();
        }
      }
    };

    const handleOpenCustomEvent = () => {
      openCoffeeBar();
    };

    const handleOpenFocusEvent = () => {
      openFocusModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-coffee-bar', handleOpenCustomEvent);
    window.addEventListener('open-focus-modal', handleOpenFocusEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-coffee-bar', handleOpenCustomEvent);
      window.removeEventListener('open-focus-modal', handleOpenFocusEvent);
    };
  }, [openCoffeeBar, openFocusModal, isAuthenticated]);

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

      {/* Global Pomodoro Focus Mode & Break Rewards */}
      {isAuthenticated && (
        <>
          <FocusModal />
          <FocusWidget />
          <FocusBreakPromptModal />
        </>
      )}
    </>
  );
}

export default App;