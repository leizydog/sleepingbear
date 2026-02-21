import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/organisms/Header';
import DataTable from '../../components/organisms/DataTable';
import Icon from '../../components/atoms/Icon';
import { propertyAPI, bookingAPI, paymentsAPI } from '../../services/api';
import { Loader2, Image as ImageIcon, Inbox, LayoutGrid, CalendarDays, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// --- PAYMENT REVIEW MODAL ---
const PaymentReviewModal = ({ payment, onClose, onReview }) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="bg-[#a86add] p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Review Tenant Payment</h3>
          <button onClick={onClose}><Icon name="X" className="text-white" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">₱{payment.amount}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Method</p>
              <p className="font-bold text-gray-800 dark:text-gray-200 uppercase">{payment.method}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 dark:text-gray-400">Booking Reference</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">Booking #{payment.booking_id}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Proof of Payment</p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center justify-center min-h-[200px]">
              {payment.proof ? (
                <img src={payment.proof} alt="Receipt" className="max-h-[300px] rounded object-contain" />
              ) : (
                <p className="text-gray-400 italic">No receipt image uploaded</p>
              )}
            </div>
            {payment.proof && (
              <a href={payment.proof} target="_blank" rel="noreferrer" className="block text-center text-blue-500 text-xs mt-2 hover:underline">Open full image</a>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
          <button
            onClick={() => onReview(payment.raw_id, 'reject')}
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl font-bold transition-all border border-red-200"
          >
            Reject
          </button>
          <button
            onClick={() => onReview(payment.raw_id, 'approve')}
            className="flex-1 bg-green-500 text-white hover:bg-green-600 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all"
          >
            Accept Payment
          </button>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  useAuth(); // auth context used for access control
  const [activeTab, setActiveTab] = useState('in_progress');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewPayment, setReviewPayment] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // ✅ Fetch Properties owned by this user
      const propsRes = await propertyAPI.getMyListings();
      setProperties(propsRes);

      // ✅ Fetch Bookings received by this user
      const booksRes = await bookingAPI.getOwnerBookings();
      setBookings(booksRes);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const openReviewModal = async (booking) => {
    try {
      const payments = await paymentsAPI.getBookingPayments(booking.id);
      const pendingPayment = payments.find(p => p.status === 'pending');

      if (!pendingPayment) {
        alert("No pending payment found for this booking.");
        return;
      }

      setReviewPayment({
        raw_id: pendingPayment.id,
        booking_id: booking.id,
        amount: pendingPayment.amount.toLocaleString(),
        method: pendingPayment.payment_method,
        proof: pendingPayment.receipt_url
      });
    } catch (error) {
      console.error("Error fetching payment details:", error);
      alert("Could not load payment details.");
    }
  };

  const handlePaymentReview = async (paymentId, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} this payment?`)) return;
    try {
      await paymentsAPI.review(paymentId, action);
      alert(`Payment ${action}ed successfully.`);
      setReviewPayment(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to update payment status.");
    }
  };

  // --- STRICT FILTERING ---
  // Pending Approval Tab: Shows only 'pending'
  const pendingProperties = properties.filter(p => p.status?.toLowerCase() === 'pending');

  // Active Listings Tab: Shows ALL properties (pending, approved, rejected)
  const allProperties = properties.filter(p => !p.status || ['approved', 'active', 'pending', 'rejected'].includes(p.status.toLowerCase()));

  const tabs = [
    { id: 'in_progress', label: 'Pending Approval', icon: Inbox, count: pendingProperties.length },
    { id: 'listings', label: 'My Listings', icon: LayoutGrid, count: allProperties.length },
    { id: 'bookings', label: 'Received Bookings', icon: CalendarDays, count: bookings.length },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  // --- HELPERS ---
  const StatusBadge = ({ status }) => {
    let styles = 'bg-gray-100 text-gray-600';
    const s = status ? status.toLowerCase() : 'unknown';
    let label = status;

    if (s === 'active' || s === 'confirmed' || s === 'approved') styles = 'bg-emerald-100 text-emerald-700';
    if (s === 'pending') styles = 'bg-amber-100 text-amber-800';
    if (s === 'rejected' || s === 'cancelled') styles = 'bg-rose-100 text-rose-700';

    // Use consistent terminology with Admin Dashboard
    if (s === 'approved') label = 'Accepted';
    if (s === 'rejected') label = 'Declined';

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${styles}`}>
        {label}
      </span>
    );
  };

  // eslint-disable-next-line no-unused-vars
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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const PropertyThumbnail = ({ images, name }) => {
    let imageUrl = (images && images.length > 0) ? images[0] : null;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${API_BASE_URL}/${imageUrl}`;
    }

    if (imageUrl) {
      return <img src={imageUrl} alt={name} className="w-14 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-700" />;
    }
    return (
      <div className="w-14 h-10 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600">
        <ImageIcon size={16} />
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'in_progress') {
      if (pendingProperties.length === 0) return <EmptyState message="No properties pending approval." />;
      return (
        <DataTable
          data={pendingProperties}
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'IMAGE', render: (r) => <PropertyThumbnail images={r.images} name={r.name} /> },
            { header: 'PROPERTY NAME', accessor: 'name' },
            { header: 'ADDRESS', accessor: 'address' },
            { header: 'PRICE', render: (r) => `₱${r.price_per_month?.toLocaleString()}` },
            { header: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      );
    }

    if (activeTab === 'listings') {
      if (allProperties.length === 0) return <EmptyState message="No properties listed yet." />;
      return (
        <DataTable
          data={allProperties}
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'IMAGE', render: (r) => <PropertyThumbnail images={r.images} name={r.name} /> },
            { header: 'NAME', accessor: 'name' },
            { header: 'SIZE', render: (r) => r.size_sqm ? `${r.size_sqm} m²` : '-' },
            { header: 'PRICE', render: (r) => `₱${r.price_per_month?.toLocaleString()}` },
            { header: 'STATUS', render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      );
    }

    if (activeTab === 'bookings') {
      if (bookings.length === 0) return <EmptyState message="No bookings received yet." />;
      return (
        <DataTable
          data={bookings}
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'PROPERTY ID', accessor: 'property_id' },
            { header: 'TENANT', accessor: 'user_id', render: (r) => `User #${r.user_id}` },
            { header: 'DATES', render: (r) => <span className="text-xs font-medium text-gray-500">{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</span> },
            { header: 'TOTAL', render: (r) => <span className="font-bold text-gray-800">₱{r.total_amount?.toLocaleString()}</span> },
            { header: 'STATUS', render: (r) => <StatusBadge status={r.status} /> },
            {
              header: 'ACTION',
              render: (r) => (
                r.status === 'pending' ? (
                  <button
                    onClick={() => openReviewModal(r)}
                    className="bg-[#a86add] hover:bg-[#965ac9] text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm transition-colors"
                  >
                    Review
                  </button>
                ) : (
                  <span className="text-gray-400 text-xs">Done</span>
                )
              )
            },
          ]}
        />
      );
    }

    // ✅ ENHANCED: Reports Tab with Filter, Sort, and Downloads
    if (activeTab === 'reports') {
      const completedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const avgBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
      const pendingRevenue = bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + (b.total_amount || 0), 0);

      // Sort bookings for the table
      const sortedBookings = [...bookings].sort((a, b) => {
        return new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date);
      });

      const exportBookingsCSV = () => {
        const headers = ['Booking ID', 'Property ID', 'Tenant ID', 'Start Date', 'End Date', 'Amount', 'Status', 'Created At'];
        const rows = bookings.map(b => [
          b.id,
          b.property_id,
          b.user_id,
          new Date(b.start_date).toLocaleDateString(),
          new Date(b.end_date).toLocaleDateString(),
          b.total_amount,
          b.status,
          b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      };

      const exportPropertiesCSV = () => {
        const headers = ['Property ID', 'Name', 'Address', 'Price/Month', 'Bedrooms', 'Bathrooms', 'Size (sqm)', 'Status'];
        const rows = properties.map(p => [
          p.id,
          p.name,
          p.address || 'N/A',
          p.price_per_month,
          p.bedrooms || 'N/A',
          p.bathrooms || 'N/A',
          p.size_sqm || 'N/A',
          p.status
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `properties_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      };

      const exportRevenueCSV = () => {
        const headers = ['Report Type', 'Value'];
        const rows = [
          ['Total Revenue', `₱${totalRevenue.toLocaleString()}`],
          ['Pending Revenue', `₱${pendingRevenue.toLocaleString()}`],
          ['Completed Bookings', completedBookings.length],
          ['Total Bookings', bookings.length],
          ['Average Booking Value', `₱${avgBookingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
          ['Total Properties', properties.length],
          ['Approved Properties', properties.filter(p => p.status === 'approved').length],
          ['Report Generated', new Date().toLocaleString()]
        ];

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue_summary_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      };

      return (
        <div className="p-6 space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
              <p className="text-sm font-bold opacity-80 mb-1">Total Revenue</p>
              <p className="text-2xl font-extrabold">₱{totalRevenue.toLocaleString()}</p>
              <p className="text-xs opacity-70 mt-2">{completedBookings.length} completed</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
              <p className="text-sm font-bold opacity-80 mb-1">Pending Revenue</p>
              <p className="text-2xl font-extrabold">₱{pendingRevenue.toLocaleString()}</p>
              <p className="text-xs opacity-70 mt-2">Awaiting confirmation</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
              <p className="text-sm font-bold opacity-80 mb-1">Avg Booking</p>
              <p className="text-2xl font-extrabold">₱{avgBookingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs opacity-70 mt-2">Per booking</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
              <p className="text-sm font-bold opacity-80 mb-1">Properties</p>
              <p className="text-2xl font-extrabold">{properties.length}</p>
              <p className="text-xs opacity-70 mt-2">{properties.filter(p => p.status === 'approved').length} approved</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Download Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={exportBookingsCSV}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon name="Download" size={16} className="text-blue-500" />
                <span className="font-medium text-gray-700 dark:text-gray-200">Bookings Report</span>
              </button>
              <button
                onClick={exportPropertiesCSV}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon name="Download" size={16} className="text-purple-500" />
                <span className="font-medium text-gray-700 dark:text-gray-200">Properties Report</span>
              </button>
              <button
                onClick={exportRevenueCSV}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon name="Download" size={16} className="text-emerald-500" />
                <span className="font-medium text-gray-700 dark:text-gray-200">Revenue Summary</span>
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Booking History</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{bookings.length} total bookings</span>
            </div>
            <DataTable
              data={sortedBookings}
              columns={[
                { header: 'ID', accessor: 'id', className: 'p-3 font-bold' },
                { header: 'Property', render: (r) => `Property #${r.property_id}`, className: 'p-3' },
                { header: 'Tenant', render: (r) => `User #${r.user_id}`, className: 'p-3' },
                { header: 'Dates', render: (r) => <span className="text-xs">{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</span>, className: 'p-3' },
                { header: 'Amount', render: (r) => <span className="font-bold text-green-600 dark:text-green-400">₱{r.total_amount?.toLocaleString()}</span>, className: 'p-3' },
                { header: 'Status', render: (r) => <StatusBadge status={r.status} />, className: 'p-3 text-center' },
              ]}
            />
          </div>
        </div>
      );
    }
  };

  const EmptyState = ({ message }) => (
    <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-3">
        <Inbox size={32} className="opacity-50" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#a86add]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-gray-950 font-sans text-gray-900 dark:text-white transition-colors">
      <Header isLoggedIn={true} />

      {reviewPayment && (
        <PaymentReviewModal
          payment={reviewPayment}
          onClose={() => setReviewPayment(null)}
          onReview={handlePaymentReview}
        />
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your properties and track bookings.</p>
          </div>
          <button
            onClick={() => navigate('/owner/add-listing')}
            className="bg-[#a86add] hover:bg-[#965ac9] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Icon name="Plus" size={18} />
            Add New Listing
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto pb-1">
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
                    ? 'text-[#a86add] bg-white dark:bg-gray-900 border-b-2 border-[#a86add] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <TabIcon size={18} className={isActive ? 'stroke-[2.5px]' : ''} />
                <span className={`text-sm ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
                  {tab.label}
                </span>
                {tab.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#a86add]/10 text-[#a86add]' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[400px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;