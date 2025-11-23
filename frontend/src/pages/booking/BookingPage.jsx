import React, { useState } from 'react';
import Header from '../../components/organisms/Header';
import StatsCards from '../../components/organisms/StatsCards';
import BookingCard from '../../components/molecules/BookingCard';
import Icon from '../../components/atoms/Icon'; 
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Download, X } from 'lucide-react'; // Added icons for modal

// --- Modal Component for Details and Confirmation (Defined outside the main component) ---
const ActionModal = ({ isOpen, onClose, title, content, actions }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative">
        {/* Header */}
        <div className={`p-5 rounded-t-2xl border-b flex justify-between items-center ${title.includes('Cancel') ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-800'}`}>
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <Icon name="X" size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {content}
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
};


const initialBookings = [
    {
      id: 'BKG-301', bookingId: 'BKG-301',
      propertyName: '2-Bedroom Condo in Pasig', location: '123 Pasig St., Pasig City',
      unitType: '2-Bedroom', price: '₱25,000', totalAmount: '₱900,000', checkIn: 'Aug 1, 2025', checkOut: 'Aug 1, 2028', duration: '3 years',
      status: 'confirmed', paymentStatus: 'paid', bookingDate: 'July 15, 2025'
    },
    {
      id: 'BKG-302', bookingId: 'BKG-302',
      propertyName: 'Studio Unit in BGC', location: '456 BGC, Taguig City',
      unitType: 'Studio', price: '₱18,000', totalAmount: '₱216,000', checkIn: 'Sep 1, 2025', checkOut: 'Sep 1, 2026', duration: '1 year',
      status: 'pending', paymentStatus: 'pending', bookingDate: 'August 1, 2025'
    },
    {
      id: 'BKG-303', bookingId: 'BKG-303',
      propertyName: '1-Bedroom Condo in Makati', location: '789 Ayala Ave., Makati City',
      unitType: '1-Bedroom', price: '₱22,000', totalAmount: '₱264,000', checkIn: 'Jun 1, 2024', checkOut: 'Jun 1, 2025', duration: '1 year',
      status: 'completed', paymentStatus: 'paid', bookingDate: 'May 15, 2024'
    },
    {
      id: 'BKG-304', bookingId: 'BKG-304',
      propertyName: 'Luxury Penthouse in Ortigas', location: '101 EDSA, Ortigas Center',
      unitType: '3-Bedroom Penthouse', price: '₱45,000', totalAmount: '₱540,000', checkIn: 'Oct 1, 2025', checkOut: 'Oct 1, 2026', duration: '1 year',
      status: 'cancelled', paymentStatus: 'refunded', bookingDate: 'August 10, 2025'
    }
];

const BookingPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookings, setBookings] = useState(initialBookings);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });
  const { user } = useAuth();

  // --- HANDLERS ---
  
  const handleViewDetails = (id) => {
    const booking = bookings.find(b => b.id === id);
    setModalState({ isOpen: true, type: 'details', data: booking });
  };

  const handleDownloadReceipt = (booking) => {
    setModalState({ 
        isOpen: true, 
        type: 'receipt', 
        data: booking 
    });
  };

  const handleCancelBooking = (booking) => {
    setModalState({ 
        isOpen: true, 
        type: 'confirm_cancel', 
        data: booking 
    });
  };

  const confirmCancellation = (id) => {
    setBookings(prevBookings => 
        prevBookings.map(b => 
            b.id === id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b
        )
    );
    setModalState({ isOpen: false, type: null, data: null });
    setActiveFilter('cancelled');
  };

  // --- MODAL RENDER LOGIC ---

  const renderModalContent = () => {
    const { type, data } = modalState;

    if (!data) return null;

    if (type === 'details') {
        return (
            <div className="space-y-4 text-sm">
                <h4 className="font-extrabold text-lg mb-2 text-gray-800">{data.propertyName} ({data.bookingId})</h4>
                <p><strong>Location:</strong> {data.location}</p>
                <p><strong>Unit Type:</strong> {data.unitType}</p>
                <p><strong>Total Amount:</strong> {data.totalAmount}</p>
                <p><strong>Check-in/out:</strong> {data.checkIn} — {data.checkOut} ({data.duration})</p>
                <p><strong>Current Status:</strong> {data.status.toUpperCase()}</p>
                <p className="text-gray-500 pt-2">Detailed property information and contact details are available upon viewing.</p>
            </div>
        );
    }
    if (type === 'confirm_cancel') {
        return (
            <div className="text-center p-4">
                <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
                <h4 className="font-bold text-lg">Confirm Cancellation</h4>
                <p className="text-red-600 mt-2">Are you sure you want to cancel booking **{data.bookingId}**?</p>
                <p className="text-sm text-gray-600">This action is permanent and will trigger a refund request.</p>
            </div>
        );
    }
    if (type === 'receipt') {
         return (
            <div className="text-center p-4">
                <Icon name="Download" size={40} className="text-blue-500 mx-auto mb-3" />
                <h4 className="font-bold text-lg">Receipt Ready</h4>
                <p className="text-gray-600 mt-2">A PDF receipt for booking **{data.bookingId}** is ready to download.</p>
            </div>
        );
    }
    return null;
  };

  const renderModalActions = () => {
    const { type, data } = modalState;

    if (type === 'details' || type === 'receipt') {
        return (
            <>
                <button onClick={() => setModalState({ isOpen: false })} className="px-4 py-2 bg-gray-200 rounded-lg font-medium">Close</button>
                {type === 'receipt' && (
                    <button onClick={() => alert("Downloading receipt...")} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Download</button>
                )}
            </>
        );
    }
    if (type === 'confirm_cancel') {
        return (
            <>
                <button onClick={() => setModalState({ isOpen: false })} className="px-4 py-2 bg-gray-200 rounded-lg font-medium">No, Keep Booking</button>
                <button onClick={() => confirmCancellation(data.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium">Yes, Cancel It</button>
            </>
        );
    }
    return null;
  };


  // --- MAIN RENDER ---
  const tabs = ['all', 'confirmed', 'pending', 'completed', 'cancelled'];
  const filteredBookings = activeFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status.toLowerCase() === activeFilter);

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <Header isLoggedIn={!!user} />

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Page Header and Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-500">Track and manage all your property bookings</p>
        </div>
        <StatsCards bookings={bookings} />

        {/* Tab Navigation (Filter UI) */}
        <div className="bg-white rounded-xl shadow-sm mb-8 px-6 pt-2 border border-gray-100">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const count = tab === 'all' ? bookings.length : bookings.filter(b => b.status.toLowerCase() === tab).length;
              const isActive = activeFilter === tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`py-4 text-sm font-bold capitalize border-b-[3px] transition-all whitespace-nowrap flex items-center gap-2
                    ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                  `}
                >
                  {tab === 'all' ? 'All Bookings' : tab} <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6 animate-fade-in">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onView={handleViewDetails}
                onDownload={handleDownloadReceipt}
                onCancel={handleCancelBooking}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">No bookings found in this category.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Modal */}
      <ActionModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false })} 
        title={modalState.type === 'details' ? `Details for ${modalState.data?.bookingId}` : modalState.type === 'receipt' ? 'Download Receipt' : 'Cancel Booking'}
        content={renderModalContent()}
        actions={renderModalActions()}
      />
    </div>
  );
};

export default BookingPage;