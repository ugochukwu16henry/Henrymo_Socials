import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TeamsPage from './pages/TeamsPage';
import ContentPage from './pages/ContentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ResearchPage from './pages/ResearchPage';
import SocialAccountsPage from './pages/SocialAccountsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import api from './services/api';

function App() {
  const { isAuthenticated, token, user, setAuth } = useAuthStore();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    if (!token && !user) {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state?.token && parsed.state?.user) {
            setAuth(parsed.state.token, parsed.state.user);
            api.defaults.headers.common['Authorization'] = `Bearer ${parsed.state.token}`;
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [token, user, setAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/oauth/callback/meta" element={<OAuthCallbackPage />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/social-accounts" element={<SocialAccountsPage />} />
          <Route path="/social-accounts/:teamId" element={<SocialAccountsPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

