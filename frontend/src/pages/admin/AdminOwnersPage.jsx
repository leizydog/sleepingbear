// src/pages/admin/AdminOwnersPage.jsx
import React, { useState } from 'react';
// FaEdit and FaTrash replaced by Unicode characters

const mockOwners = [
    { id: 'OWN001', full_name: 'Joe Sardoma', email: 'joe.s@example.com', contact_no: '0917-555-1234', units_listed: 2 },
    { id: 'OWN002', full_name: 'Arthur Lim', email: 'arthur.l@example.com', contact_no: '0917-555-5678', units_listed: 4 },
    { id: 'OWN003', full_name: 'Maria Santos', email: 'maria.s@example.com', contact_no: '0917-555-9012', units_listed: 1 },
];

const AdminOwnersPage = () => {
    const [owners, setOwners] = useState(mockOwners);
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (ownerId) => { alert(`Editing Owner ID: ${ownerId}`); };
    const handleDelete = (ownerId) => { 
        if (window.confirm(`Are you sure you want to delete Owner ID: ${ownerId}?`)) {
            setOwners(owners.filter(owner => owner.id !== ownerId));
        }
    };

    const filteredOwners = owners.filter(owner =>
        Object.values(owner).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="admin-management-page">
            <h1 className="admin-page-header">Manage Owners</h1>
            <div className="control-bar">
                <input type="text" placeholder="Search by ID, Name, or Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input-admin"/>
                <button className="btn-primary-admin" onClick={() => alert('Add Owner form triggered')}>+ Add New Owner</button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th><th>Full Name</th><th>Email</th><th>Contact No.</th><th className="text-center"># of Units Listed</th><th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOwners.length > 0 ? (
                            filteredOwners.map((owner) => (
                                <tr key={owner.id}>
                                    <td>{owner.id}</td><td>{owner.full_name}</td><td>{owner.email}</td><td>{owner.contact_no}</td><td className="text-center">{owner.units_listed}</td>
                                    <td className="text-center action-cells">
                                        <button onClick={() => handleEdit(owner.id)} className="action-btn btn-edit" title="Edit">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(owner.id)} className="action-btn btn-delete" title="Delete">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (<tr><td colSpan="6" className="text-center">No owners found matching your search.</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOwnersPage;