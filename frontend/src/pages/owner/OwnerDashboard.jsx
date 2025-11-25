import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../../components/organisms/Header'; 
import DataTable from '../../components/organisms/DataTable';
import Icon from '../../components/atoms/Icon';
import { propertyAPI, bookingAPI } from '../../services/api';
import { Loader2, Image as ImageIcon, Inbox, LayoutGrid, CalendarDays } from 'lucide-react';

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
            const propsRes = await propertyAPI.getAll();
            setProperties(propsRes.data.properties);

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
  
  // --- TAB CONFIGURATION ---
  const tabs = [
    { id: 'in_progress', label: 'In Progress', icon: Inbox, count: pendingProperties.length },
    { id: 'listings',    label: 'Listings',    icon: LayoutGrid, count: activeProperties.length },
    { id: 'bookings',    label: 'Bookings',    icon: CalendarDays, count: bookings.length },
  ];

  // --- HELPERS ---
  const StatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-600';
    if (status === 'active' || status === 'confirmed') styles = 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') styles = 'bg-amber-100 text-amber-800';
    if (status === 'rejected' || status === 'cancelled') styles = 'bg-rose-100 text-rose-700';
    
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${styles}`}>
        {status}
      </span>
    );
  };

  const PaymentBadge = ({ method }) => {
    if (!method) return <span className="text-gray-400 text-xs italic">N/A</span>;
    let styles = 'bg-gray-100 text-gray-600 border border-gray-200';
    const m = method.toLowerCase();
    
    if (m.includes('gcash')) styles = 'bg-blue-50 text-blue-600 border-blue-200';
    if (m.includes('bpi')) styles = 'bg-red-50 text-red-700 border-red-200';
    if (m.includes('cash')) styles = 'bg-green-50 text-green-700 border-green-200';

    return (
        <div className={`flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold uppercase w-20 text-center ${styles}`}>
            {method}
        </div>
    );
  };

  const PropertyThumbnail = ({ images, name }) => {
    const imageUrl = (images && images.length > 0) ? images[0] : null;
    if (imageUrl) {
        return <img src={imageUrl} alt={name} className="w-14 h-10 object-cover rounded-md border border-gray-200" />;
    }
    return (
        <div className="w-14 h-10 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-center text-gray-300">
            <ImageIcon size={16} />
        </div>
    );
  };

  // --- CONTENT RENDERER ---
  const renderContent = () => {
    // 1. In Progress Table
    if (activeTab === 'in_progress') {
        if (pendingProperties.length === 0) return <EmptyState message="No pending properties found." />;
        return (
            <DataTable 
                data={pendingProperties}
                columns={[
                    { header: 'ID', accessor: 'id' },
                    { header: 'IMAGE', render: (r) => <PropertyThumbnail images={r.images} name={r.name} /> },
                    { header: 'PROPERTY NAME', accessor: 'name' },
                    { header: 'UNIT', accessor: 'unit_number', render: (r) => <span className="text-gray-500 font-medium">{r.unit_number || '-'}</span> },
                    { header: 'ADDRESS', accessor: 'address' },
                    { header: 'PRICE', render: (r) => `₱${r.price_per_month?.toLocaleString()}` },
                    { header: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
                ]}
            />
        );
    }

    // 2. Active Listings Table
    if (activeTab === 'listings') {
        if (activeProperties.length === 0) return <EmptyState message="No active listings yet." />;
        return (
            <DataTable 
                data={activeProperties}
                columns={[
                    { header: 'ID', accessor: 'id' },
                    { header: 'IMAGE', render: (r) => <PropertyThumbnail images={r.images} name={r.name} /> },
                    { header: 'NAME', accessor: 'name' },
                    { header: 'UNIT', accessor: 'unit_number', render: (r) => <span className="font-mono text-xs">{r.unit_number}</span> },
                    { header: 'SIZE', render: (r) => r.size_sqm ? `${r.size_sqm} m²` : '-' },
                    { header: 'ADDRESS', accessor: 'address' },
                    { header: 'PRICE', render: (r) => `₱${r.price_per_month?.toLocaleString()}` },
                    { header: 'AVAILABILITY', render: (r) => <span className={r.is_available ? "text-green-600 font-bold text-xs" : "text-red-600 font-bold text-xs"}>{r.is_available ? "Available" : "Occupied"}</span> },
                    { header: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
                ]}
            />
        );
    }

    // 3. Bookings Table
    if (activeTab === 'bookings') {
        if (bookings.length === 0) return <EmptyState message="No bookings received yet." />;
        return (
            <DataTable 
                data={bookings}
                columns={[
                    { header: 'ID', accessor: 'id' },
                    { header: 'PROP ID', accessor: 'property_id' },
                    { header: 'DATES', render: (r) => <span className="text-xs font-medium text-gray-500">{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</span> },
                    { header: 'TOTAL', render: (r) => <span className="font-bold text-gray-800">₱${r.total_amount?.toLocaleString()}</span> },
                    { header: 'PAYMENT', render: (r) => <PaymentBadge method={r.payment_method} /> },
                    { header: 'STATUS', render: (r) => <StatusBadge status={r.status} /> },
                ]}
            />
        );
    }
  };

  const EmptyState = ({ message }) => (
    <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
            <Inbox size={32} className="opacity-50" />
        </div>
        <p className="text-sm font-medium">{message}</p>
    </div>
  );

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#a86add]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-gray-900">
      <Header isLoggedIn={true} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* PAGE TITLE & ACTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your properties and track bookings.</p>
            </div>
            <button 
                onClick={() => navigate('/owner/add-listing')} 
                className="bg-[#a86add] hover:bg-[#965ac9] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
            >
                <Icon name="Plus" size={18} />
                Add New Listing
            </button>
        </div>

        {/* MODERN TAB NAVIGATION */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            
            return (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                    relative flex items-center gap-2 px-5 py-3 rounded-t-lg transition-all whitespace-nowrap
                    ${isActive 
                        ? 'text-[#a86add] bg-white border-b-2 border-[#a86add] shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                `}
                >
                <TabIcon size={18} className={isActive ? 'stroke-[2.5px]' : ''} />
                <span className={`text-sm ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
                    {tab.label}
                </span>
                
                {/* Count Badge */}
                {tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#a86add]/10 text-[#a86add]' : 'bg-gray-200 text-gray-600'
                    }`}>
                        {tab.count}
                    </span>
                )}
                </button>
            )
          })}
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
            {renderContent()}
        </div>

      </main>
    </div>
  );
};

export default OwnerDashboard;