import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../../components/organisms/Header'; 
import DataTable from '../../components/organisms/DataTable';
import Icon from '../../components/atoms/Icon';

const OwnerDashboard = () => {
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState('listings'); 

  // --- MOCK DATA ---
  const inProgressData = [
    { id: 'PR-301', name: '2-Bedroom Condo in Pasig', unit: '2-Bedroom', condo: 'Sunny Tower Residences', edited: 'Aug 20, 2025', status: 'Pending Approval' },
    { id: 'PR-302', name: 'Studio in BGC', unit: 'Studio', condo: 'Skyline Suites', edited: 'Aug 18, 2025', status: 'Draft' },
  ];

  const listingsData = [
    { id: 'PR-201', name: '2-Bedroom Condo in Pasig', loc: 'Pasig City', price: '₱25,000', avail: 'Available', status: 'Active' },
    { id: 'PR-202', name: 'Studio Unit BGC', loc: 'Taguig City', price: '₱20,000', avail: 'Occupied', status: 'Active' },
  ];

  const bookingsData = [
    { id: 'BKG-301', propertyName: '2-Bedroom Condo in Pasig', guestName: 'Juan Dela Cruz', checkIn: 'Aug 1, 2025', checkOut: 'Aug 1, 2028', paymentStatus: 'Paid' },
    { id: 'BKG-302', propertyName: 'Studio Unit BGC', guestName: 'Maria Santos', checkIn: 'Aug 1, 2030', checkOut: 'Sep 1, 2002', paymentStatus: 'Pending' }
  ];

  const paymentsData = [
    { id: 'PAY-501', bookingId: 'BKG-301', propertyName: '2-Bedroom Condo in Pasig', amount: '₱7,500', status: 'Paid', date: 'Aug 20, 2025', method: 'Bank Transfer' },
    { id: 'PAY-502', bookingId: 'BKG-302', propertyName: 'Studio Unit BGC', amount: '₱8,000', status: 'Processing', date: 'Aug 19, 2025', method: 'GCash' }
  ];

  // --- STYLING HELPERS ---
  const ImageCell = () => (
    <div className="w-12 h-12 bg-[#afa2ba] rounded-lg flex items-center justify-center text-white shadow-sm">
      <Icon name="Building" size={24} />
    </div>
  );

  const AvailabilityBadge = ({ status }) => {
    const isAvail = status === 'Available';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAvail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {status}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-700';
    if (status === 'Active' || status === 'Paid') styles = 'bg-green-100 text-green-700';
    if (status === 'Pending Approval' || status === 'Pending' || status === 'Processing') styles = 'bg-yellow-100 text-yellow-800';
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${styles}`}>
        {status}
      </span>
    );
  };

  const AddListingButton = () => (
    <button 
      onClick={() => navigate('/owner/add-listing')} 
      className="bg-[#a86add] hover:bg-[#965ac9] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5 uppercase tracking-wide"
    >
      <Icon name="Plus" size={18} />
      Add Listing
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-gray-900">
      
      {/* FORCE HEADER TO SHOW DROPDOWN */}
      <Header isLoggedIn={true} />

      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b border-gray-200 mb-10">
          {['in_progress', 'listings', 'bookings', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-extrabold uppercase tracking-wider transition-all border-b-4 ${
                activeTab === tab
                  ? 'border-[#a86add] text-[#a86add]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* --- VIEW CONTENT --- */}
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
            <AddListingButton />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-1 border border-gray-100 overflow-hidden">
            {activeTab === 'in_progress' && <DataTable 
              data={inProgressData}
              columns={[
                { header: 'PROPERTY ID', accessor: 'id' },
                { header: 'PROPERTY NAME', accessor: 'name' },
                { header: 'UNIT TYPE', accessor: 'unit' },
                { header: 'LAST EDITED', accessor: 'edited' },
                { header: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
              ]}
            />}
            {activeTab === 'listings' && <DataTable 
              data={listingsData}
              columns={[
                { header: 'ID', accessor: 'id' },
                { header: 'IMAGE', render: () => <ImageCell /> },
                { header: 'NAME', accessor: 'name' },
                { header: 'PRICE', accessor: 'price' },
                { header: 'AVAILABILITY', render: (r) => <AvailabilityBadge status={r.avail} /> },
                { header: 'STATUS', render: (r) => <StatusBadge status={r.status} /> },
              ]}
            />}
            {activeTab === 'bookings' && <DataTable 
              data={bookingsData}
              columns={[
                { header: 'ID', accessor: 'id' },
                { header: 'PROPERTY', accessor: 'propertyName' },
                { header: 'GUEST', accessor: 'guestName' },
                { header: 'CHECK-IN', accessor: 'checkIn' },
                { header: 'PAYMENT', render: (r) => <StatusBadge status={r.paymentStatus} /> },
              ]}
            />}
            {activeTab === 'payments' && <DataTable 
              data={paymentsData}
              columns={[
                { header: 'PAYMENT ID', accessor: 'id' },
                { header: 'PROPERTY', accessor: 'propertyName' },
                { header: 'AMOUNT', render: (r) => <span className="font-bold">{r.amount}</span> },
                { header: 'DATE', accessor: 'date' },
                { header: 'METHOD', accessor: 'method' },
                { header: 'STATUS', render: (r) => <StatusBadge status={r.status} /> },
              ]}
            />}
          </div>
        </div>

      </main>
    </div>
  );
};

export default OwnerDashboard;