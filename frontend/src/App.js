import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// --- UPDATED IMPORTS FOR ATOMIC DESIGN ---
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import PropertyList from './components/organisms/PropertyList/PropertyList';
import PropertyDetail from './components/organisms/PropertyDetail/PropertyDetail';
import BookingList from './components/organisms/BookingList/BookingList';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Main Layout with Navigation
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <nav className="app-navbar">
        <div className="nav-brand" onClick={() => navigate('/dashboard')}>
          <span className="logo-icon">🏢</span>
          <span>Sleeping Bear</span>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/properties')} className="nav-link">
            Properties
          </button>
          <button onClick={() => navigate('/bookings')} className="nav-link">
            Bookings
          </button>
          <div className="nav-user">
            <span>{user?.full_name || user?.username}</span>
            <button onClick={logout} className="btn-logout-nav">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="app-main">{children}</main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardHome />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <Layout>
                  <PropertyList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PropertyDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Layout>
                  <BookingList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;