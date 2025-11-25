import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Contexts ---
import { AuthProvider } from './context/AuthContext';
// FIX: Import the named provider directly
import { DarkModeProvider } from './context/ThemeContext'; 
import PublicLayout from './components/templates/PublicLayout';

// --- Pages ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BookingPage from './pages/booking/BookingPage'; 
import PaymentPage from './pages/booking/PaymentPage'; 
import ConfirmationPage from './pages/booking/ConfirmationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard'; 
import AddListingPage from './pages/owner/AddListingPage';

import SettingsPage from './pages/settings/SettingsPage';

// --- CSS ---
import './index.css';

// --- Placeholder Component ---
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800 transition-colors">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-300 mb-4">🚧</h1>
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{title}</h2>
      <p className="text-gray-500">Under Construction</p>
      <a href="/" className="text-blue-600 hover:underline mt-4 block">Go Home</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      {/* FIX: Use the named provider here */}
      <DarkModeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<Navigate to="/" replace />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            
            {/* Private User Flow */}
            <Route path="/bookings" element={<BookingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Dashboards */}
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/add-listing" element={<AddListingPage />} />

            {/* Placeholders */}
            <Route path="/property/:id" element={<Placeholder title="Property Details" />} />

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;