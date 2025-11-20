// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// All necessary imports moved to the top:
import SearchForm from './components/organisms/SearchForm/SearchForm';
import Header from './components/common/Header';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import PropertyList from './components/organisms/PropertyList/PropertyList';
import PropertyDetail from './components/organisms/PropertyDetail/PropertyDetail';
import NewListingPage from './pages/owner/NewListingPage';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminOwnersPage from './pages/admin/AdminOwnersPage';
import AdminTenantsPage from './pages/admin/AdminTenantsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Minimal Home Page component definition (resolves 'Module not found: Error: Can't resolve ./pages/HomePage')
const HomePage = () => ( 
    <div className="home-page-wrapper">
        <Header />
        <div className="home-search-container">
            <h1 className="main-title">Find a Place</h1>
            <SearchForm /> 
        </div>
    </div>
);

// Protected Route Wrapper (unchanged)...
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />; 
    }
    return children;
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/homepage" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Guest/Tenant Flow */}
                    <Route path="/properties" element={<PropertyList />} />
                    <Route path="/property/:id" element={<PropertyDetail />} />
                    
                    {/* Owner Flow (Requires Login) */}
                    <Route path="/list-place" element={
                        <ProtectedRoute allowedRoles={['owner', 'admin']}>
                            <NewListingPage />
                        </ProtectedRoute>
                    } />

                    {/* Admin Flow (Requires Admin Role) */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="home" element={<AdminDashboard />} />
                        <Route path="owners" element={<AdminOwnersPage />} />
                        <Route path="tenants" element={<AdminTenantsPage />} />
                        <Route path="reports" element={<AdminReportsPage />} />
                        <Route path="condominiums" element={<div>Manage Condominiums</div>} />
                        <Route path="payments" element={<div>Manage Payments</div>} />
                    </Route>
                    
                    {/* Fallback Dashboard for logged-in users */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <AdminLayout /> 
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;