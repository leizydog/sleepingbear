import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="logo-icon">🏢</span>
          <span>Sleeping Bear</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="welcome-icon">✅</div>
          <h1>Welcome to Sleeping Bear!</h1>
          <p className="welcome-subtitle">
            Hello, {user?.full_name || user?.username}!
          </p>
          
          <div className="user-info">
            <div className="info-item">
              <strong>Email:</strong> {user?.email}
            </div>
            <div className="info-item">
              <strong>Role:</strong> {user?.role?.toUpperCase()}
            </div>
            <div className="info-item">
              <strong>Status:</strong>{' '}
              <span className="status-active">Active</span>
            </div>
          </div>

          <div className="coming-soon">
            <p>📋 Dashboard features coming in Week 1 Day 6-7...</p>
            <p>🏠 Property listings, bookings, and more!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;