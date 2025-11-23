import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../../components/organisms/Header'; 
import DataTable from '../../components/organisms/DataTable';
import Icon from '../../components/atoms/Icon';
import { propertyAPI, bookingAPI } from '../../services/api';
import { Loader2 } from 'lucide-react';

const OwnerDashboard = () => {
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState('in_progress'); 
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Get All Properties
            const propsRes = await propertyAPI.getAll();
            setProperties(propsRes.data.properties);

            // 2. Get All Bookings
            const booksRes = await bookingAPI.getAll();
            setBookings(booksRes.data);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // --- FILTERING LOGIC ---
  const pendingProperties = properties.filter(p => p.status === 'pending');
  const activeProperties = properties.filter(p => p.status === 'active');

  // --- HELPERS ---
  const StatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-700';
    if (status === 'active' || status === 'confirmed') styles = 'bg-green-100 text-green-700';
    if (status === 'pending') styles = 'bg-yellow-100 text-yellow-800';
    if (status === 'rejected' || status === 'cancelled') styles = 'bg-red-100 text-red-700';
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${styles}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#a86add]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-gray-900">
      <Header isLoggedIn={true} />

      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b border-gray-200 mb-10">
          {['in_progress', 'listings', 'bookings'].map((tab) => (
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
            <button 
              onClick={() => navigate('/owner/add-listing')} 
              className="bg-[#a86add] hover:bg-[#965ac9] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5 uppercase tracking-wide"
            >
              <Icon name="Plus" size={18} />
              Add Listing
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-1 border border-gray-100 overflow-hidden">
            
            {/* IN PROGRESS (Pending) */}
            {activeTab === 'in_progress' && (
                <DataTable 
                  data={pendingProperties}
                  columns={[
                    { header: 'ID', accessor: 'id' },
                    { header: 'PROPERTY NAME', accessor: 'name' },
                    { header: 'ADDRESS', accessor: 'address' },
                    { header: 'PRICE', render: (r) => `₱${r.price_per_month?.toLocaleString()}` },
                    { header: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
                  ]}
                />
            )}

            {/* ACTIVE LISTINGS */}
            {activeTab === 'listings' && (
                <DataTable 
                  data={activeProperties}
                  columns={[
                    { header: 'ID', accessor: 'id' },
                    { header: 'NAME', accessor: 'name' },
                    { header: 'ADDRESS', accessor: 'address' },
                    { header: 'PRICE', render: (r) => `₱${r.price_per_month?.toLocaleString()}` },
                    { header: 'AVAILABILITY', render: (r) => <span className={r.is_available ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{r.is_available ? "Available" : "Occupied"}</span> },
                    { header: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
                  ]}
                />
            )}

            {/* BOOKINGS */}
            {activeTab === 'bookings' && (
                <DataTable 
                  data={bookings}
                  columns={[
                    { header: 'ID', accessor: 'id' },
                    { header: 'PROPERTY ID', accessor: 'property_id' },
                    { header: 'DATES', render: (r) => <span className="text-xs">{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</span> },
                    { header: 'TOTAL', render: (r) => `₱${r.total_amount?.toLocaleString()}` },
                    { header: 'STATUS', render: (r) => <StatusBadge status={r.status} /> },
                  ]}
                />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;