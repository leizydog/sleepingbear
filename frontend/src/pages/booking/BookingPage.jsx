import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react'; 
import Header from '../../components/organisms/Header';
import StatsCards from '../../components/organisms/StatsCards';
import BookingCard from '../../components/molecules/BookingCard';
import Icon from '../../components/atoms/Icon'; 
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';

// --- Modal Component (Updated for Dark Mode) ---
const ActionModal = ({ isOpen, onClose, title, content, actions }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg relative border dark:border-gray-700 transition-colors duration-300">
        {/* Header */}
        <div className={`p-5 rounded-t-2xl border-b dark:border-gray-700 flex justify-between items-center 
          ${title.includes('Cancel') 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
            : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
          }`}>
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <Icon name="X" size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 dark:bg-gray-900/50 dark:text-gray-300">
          {content}
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-end gap-3 rounded-b-2xl">
          {actions}
        </div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookings, setBookings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });
  const { user } = useAuth();

  // 1. Fetch Real Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getMyBookings();
        
        const dataList = Array.isArray(response) ? response : []; 

        const formatted = dataList.map(b => ({
            id: b.id, 
            bookingId: `BKG-${b.id}`,
            propertyName: b.property?.name || 'Property #' + b.property_id, 
            location: b.property?.address || '',
            unitType: `${b.property?.bedrooms || 1}-Bedroom`,
            price: `₱${b.total_amount.toLocaleString()}`,
            totalAmount: `₱${b.total_amount.toLocaleString()}`,
            checkIn: new Date(b.start_date).toLocaleDateString(),
            checkOut: new Date(b.end_date).toLocaleDateString(),
            status: b.status, 
            paymentStatus: b.payments?.[0]?.status || 'pending',
            bookingDate: new Date(b.created_at).toLocaleDateString()
        }));
        setBookings(formatted);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchBookings();
  }, [user]);

  // --- Handlers ---
  
  const handleViewDetails = (id) => {
    const booking = bookings.find(b => b.id === id);
    setModalState({ isOpen: true, type: 'details', data: booking });
  };

  const handleDownloadReceipt = (booking) => {
    setModalState({ isOpen: true, type: 'receipt', data: booking });
  };

  const handleCancelBooking = (booking) => {
    setModalState({ isOpen: true, type: 'confirm_cancel', data: booking });
  };

  const confirmCancellation = async (id) => {
    try {
        await bookingAPI.cancel(id); 
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        alert("Booking cancelled.");
    } catch (error) {
        console.error("Cancel failed:", error);
        alert("Failed to cancel booking.");
    }
    setModalState({ isOpen: false, type: null, data: null });
  };

  // --- Helper: Generate Receipt Text ---
  const getReceiptContent = (booking) => {
    return `
OFFICIAL RECEIPT - SLEEPING BEAR RENTALS
----------------------------------------
Date Generated: ${new Date().toLocaleString()}
Receipt ID:     REC-${booking.id}-${Date.now()}

----------------------------------------
BOOKING DETAILS
----------------------------------------
Booking Ref:    ${booking.bookingId}
Property:       ${booking.propertyName}
Location:       ${booking.location}
Unit Type:      ${booking.unitType}
Stay Period:    ${booking.checkIn} to ${booking.checkOut}

----------------------------------------
PAYMENT INFORMATION
----------------------------------------
Total Amount:   ${booking.totalAmount}
Status:         ${booking.status.toUpperCase()}
Payment Status: ${booking.paymentStatus.toUpperCase()}

----------------------------------------
Thank you for choosing Sleeping Bear!
For questions, contact admin@sleepingbear.com
    `.trim();
  };

  // --- Download Logic ---
  const downloadReceipt = (booking) => {
    const receiptContent = getReceiptContent(booking);
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${booking.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // --- Modal Logic (Dark Mode applied) ---

  const renderModalContent = () => {
    const { type, data } = modalState;

    if (!data) return null;

    if (type === 'details') {
        return (
            <div className="space-y-4 text-sm bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:text-gray-300 border dark:border-gray-700">
                <h4 className="font-extrabold text-lg mb-2 text-gray-800 dark:text-white">{data.propertyName} ({data.bookingId})</h4>
                <p><strong>Location:</strong> {data.location}</p>
                <p><strong>Unit Type:</strong> {data.unitType}</p>
                <p><strong>Total Amount:</strong> {data.totalAmount}</p>
                <p><strong>Check-in/out:</strong> {data.checkIn} — {data.checkOut}</p>
                <p><strong>Current Status:</strong> {data.status.toUpperCase()}</p>
            </div>
        );
    }
    if (type === 'confirm_cancel') {
        return (
            <div className="text-center p-4">
                <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
                <h4 className="font-bold text-lg dark:text-white">Confirm Cancellation</h4>
                <p className="text-red-600 dark:text-red-400 mt-2">Are you sure you want to cancel booking <strong>{data.bookingId}</strong>?</p>
            </div>
        );
    }
    
    // --- View Receipt Online ---
    if (type === 'receipt') {
         return (
            <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 border-dashed p-6 rounded-xl w-full shadow-sm font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {getReceiptContent(data)}
                </div>
                <p className="text-xs text-gray-400 mt-4">This is a digital copy of your receipt.</p>
            </div>
        );
    }
    return null;
  };

  const renderModalActions = () => {
    const { type, data } = modalState;

    if (type === 'details') {
        return (
            <button onClick={() => setModalState({ isOpen: false })} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Close</button>
        );
    }
    
    if (type === 'receipt') {
        return (
            <>
                <button onClick={() => setModalState({ isOpen: false })} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Close</button>
                <button onClick={() => downloadReceipt(data)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Icon name="Download" size={16} /> Download PDF
                </button>
            </>
        );
    }

    if (type === 'confirm_cancel') {
        return (
            <>
                <button onClick={() => setModalState({ isOpen: false })} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600">No, Keep Booking</button>
                <button onClick={() => confirmCancellation(data.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Yes, Cancel It</button>
            </>
        );
    }
    return null;
  };

  // --- Main Render ---
  const tabs = ['all', 'confirmed', 'pending', 'completed', 'cancelled'];
  const filteredBookings = activeFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status.toLowerCase() === activeFilter);

  return (
    // ADDED: dark:bg-gray-950
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-gray-950 font-sans transition-colors duration-300">
      <Header isLoggedIn={!!user} />

      <div className="max-w-7xl mx-auto px-6 py-10 pt-28">
        
        <div className="mb-8">
          {/* ADDED: dark:text-white, dark:text-gray-400 */}
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage all your property bookings</p>
        </div>
        
        {!loading && <StatsCards bookings={bookings} />}

        {/* Filter UI */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm mb-8 px-6 pt-2 border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const count = tab === 'all' ? bookings.length : bookings.filter(b => b.status.toLowerCase() === tab).length;
              const isActive = activeFilter === tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`py-4 text-sm font-bold capitalize border-b-[3px] transition-all whitespace-nowrap flex items-center gap-2
                    ${isActive 
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
                  `}
                >
                  {tab === 'all' ? 'All Bookings' : tab} 
                  {/* Badge: dark mode colors added */}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="space-y-6 animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-gray-400" size={40} />
            </div>
          ) : filteredBookings.length > 0 ? (
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
            // Empty State: dark mode bg and borders
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-400">No bookings found in this category.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Modal */}
      <ActionModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false })} 
        title={modalState.type === 'details' ? `Details for ${modalState.data?.bookingId}` : modalState.type === 'receipt' ? 'Booking Receipt' : 'Cancel Booking'}
        content={renderModalContent()}
        actions={renderModalActions()}
      />
    </div>
  );
};

export default BookingPage;