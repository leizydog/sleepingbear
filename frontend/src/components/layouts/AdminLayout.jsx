// src/components/layouts/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navItems = [
        { path: 'home', icon: '📊', label: 'Dashboard' },
        { path: 'owners', icon: '👤', label: 'Owners' },
        { path: 'tenants', icon: '👥', label: 'Tenants' },
        { path: 'condominiums', icon: '🏢', label: 'Condominiums' },
        { path: 'payments', icon: '💳', label: 'Payments' },
        { path: 'reports', icon: '📋', label: 'Generate Reports' },
    ];

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.path === 'home'} 
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <p className="user-info">Manage Account</p>
                <button className="btn-logout-admin" onClick={logout}>Log Out</button>
            </div>
        </div>
    );
};

const AdminLayout = () => {
    return (
        <div className="admin-layout-wrapper">
            <AdminSidebar />
            <main className="admin-content-area">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;