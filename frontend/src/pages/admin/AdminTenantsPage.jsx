// src/pages/admin/AdminTenantsPage.jsx
import React, { useState } from 'react';
// FaEdit and FaTrash replaced by Unicode characters

const mockTenants = [
    { id: 'TN001', full_name: 'Mona Dela Cruz', email: 'mona.d@tenant.com', contact_no: '0919-111-2222', booking_count: 3 },
    { id: 'TN002', full_name: 'Richard Gomez', email: 'r.gomez@tenant.com', contact_no: '0920-333-4444', booking_count: 1 },
    { id: 'TN003', full_name: 'Sofia Reyes', email: 'sofia.r@tenant.com', contact_no: '0921-555-6666', booking_count: 5 },
];

const AdminTenantsPage = () => {
    const [tenants, setTenants] = useState(mockTenants);
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (tenantId) => { alert(`Editing Tenant ID: ${tenantId}`); };
    const handleDelete = (tenantId) => { 
        if (window.confirm(`Are you sure you want to delete Tenant ID: ${tenantId}?`)) {
            setTenants(tenants.filter(tenant => tenant.id !== tenantId));
        }
    };

    const filteredTenants = tenants.filter(tenant =>
        Object.values(tenant).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="admin-management-page">
            <h1 className="admin-page-header">Manage Tenants</h1>
            <div className="control-bar">
                <input type="text" placeholder="Search by ID, Name, or Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input-admin"/>
                <button className="btn-primary-admin" onClick={() => alert('Add Tenant form triggered')}>+ Add New Tenant</button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th><th>Full Name</th><th>Email</th><th>Contact No.</th><th className="text-center">Booking Count</th><th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTenants.length > 0 ? (
                            filteredTenants.map((tenant) => (
                                <tr key={tenant.id}>
                                    <td>{tenant.id}</td><td>{tenant.full_name}</td><td>{tenant.email}</td><td>{tenant.contact_no}</td><td className="text-center">{tenant.booking_count}</td>
                                    <td className="text-center action-cells">
                                        <button onClick={() => handleEdit(tenant.id)} className="action-btn btn-edit" title="Edit">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(tenant.id)} className="action-btn btn-delete" title="Delete">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (<tr><td colSpan="6" className="text-center">No tenants found matching your search.</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTenantsPage;