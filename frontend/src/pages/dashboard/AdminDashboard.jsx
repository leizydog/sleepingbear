// src/pages/dashboard/AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
    const stats = [
        { label: 'Total Owners', value: 4, icon: '👤' },
        { label: 'Total Tenants', value: 12, icon: '👥' },
        { label: 'Total Condominiums', value: 6, icon: '🏢' },
        { label: 'Total Users', value: 16, icon: '🧑‍🤝‍🧑' },
        { label: 'Payments (Done)', value: 154, icon: '✅' },
    ];

    return (
        <div className="admin-dashboard-page">
            <h1 className="admin-page-header">Dashboard Overview</h1>
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <span className="stat-icon">{stat.icon}</span>
                        <div className="stat-info">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="charts-section">
                <div className="chart-card">
                    <h2 className="chart-title">Retention Curves</h2>
                    <div className="chart-placeholder"><p>Placeholder for Retention Curves Chart</p></div>
                </div>

                <div className="chart-card">
                    <h2 className="chart-title">Sales Monthly</h2>
                    <div className="chart-placeholder"><p>Placeholder for Sales Monthly Bar Chart</p></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;