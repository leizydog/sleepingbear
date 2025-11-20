// src/pages/admin/AdminReportsPage.jsx
import React, { useState } from 'react';
// FaDownload replaced by Unicode character

const reportTypes = [
    { value: 'all_payments', label: 'All Payments' },
    { value: 'active_listings', label: 'Active Listings' },
    { value: 'owner_performance', label: 'Owner Performance Summary' },
    { value: 'tenant_bookings', label: 'Tenant Booking History' },
];

const reportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel (XLSX)' },
    { value: 'csv', label: 'CSV' },
];

const AdminReportsPage = () => {
    const [reportParams, setReportParams] = useState({
        report_type: '', period_start: '', period_ends: '', report_format: 'pdf',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReportParams(prev => ({ ...prev, [name]: value }));
    };

    const handleDownload = async (e) => {
        e.preventDefault(); setError(null);
        
        if (!reportParams.report_type || !reportParams.period_start || !reportParams.period_ends) {
            setError('Please select a report type and complete the date range.'); return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            alert(`Simulated Download Success!\nReport: ${reportParams.report_type}\nFormat: ${reportParams.report_format}`);
        } catch (err) {
            setError('Report generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-reports-page admin-management-page">
            <h1 className="admin-page-header">Generate Reports</h1>

            <form onSubmit={handleDownload} className="report-form">
                <div className="report-card">
                    <h2>Create a Report</h2>
                    <div className="input-group full-width">
                        <label>Select Report</label>
                        <select name="report_type" value={reportParams.report_type} onChange={handleChange} className="admin-input-select" required>
                            <option value="">-- Select Report Type --</option>
                            {reportTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                        </select>
                    </div>

                    <div className="date-range-group">
                        <label className="date-range-label">Date Range:</label>
                        <div className="date-inputs-grid">
                            <div className="input-group"><label>Period Start:</label><input name="period_start" type="date" value={reportParams.period_start} onChange={handleChange} className="admin-input-date" required/></div>
                            <div className="input-group"><label>Period Ends:</label><input name="period_ends" type="date" value={reportParams.period_ends} onChange={handleChange} className="admin-input-date" required/></div>
                        </div>
                    </div>

                    <div className="input-group full-width report-format-group">
                        <label>Report Format</label>
                        <div className="format-options-grid">
                            {reportFormats.map(format => (
                                <label key={format.value} className="format-radio-label">
                                    <input type="radio" name="report_format" value={format.value} checked={reportParams.report_format === format.value} onChange={handleChange}/>{format.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn-primary-admin btn-download" disabled={loading}>
                        ⬇️ {loading ? 'Generating...' : 'Download Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminReportsPage;