import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import NotFoundPage from './pages/NotFoundPage';
import NotAuthorizedPage from './pages/NotAuthorizedPage';
import PrivateRoute from './components/common/PrivateRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
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
  );
}

export default App;