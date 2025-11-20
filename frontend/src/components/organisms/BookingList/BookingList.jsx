// Main, self-contained React file for the Booking Management Application.
// This file includes mocked dependencies (Auth, API, Modal) for a runnable demonstration.

import React, { useState, useEffect, createContext, useContext } from 'react';
import './Bookings.css'; // ⭐️ Importing the new CSS file

// --- 1. Mock Data and Mock API Client ---

const initialBookings = [
  {
    id: 101,
    property_id: 501,
    start_date: '2025-12-01T00:00:00Z',
    end_date: '2025-12-07T00:00:00Z',
    status: 'Confirmed',
    total_amount: 1500,
  },
  {
    id: 102,
    property_id: 505,
    start_date: '2025-11-20T00:00:00Z',
    end_date: '2025-11-25T00:00:00Z',
    status: 'Pending',
    total_amount: 950,
  },
  {
    id: 103,
    property_id: 512,
    start_date: '2026-01-15T00:00:00Z',
    end_date: '2026-01-30T00:00:00Z',
    status: 'Cancelled',
    total_amount: 3200,
  },
];

// Mock API client to simulate network requests
const mockApi = {
  // Simulate GET request to fetch bookings
  get: (url) => new Promise((resolve) => {
    setTimeout(() => {
      if (url === '/bookings/') {
        // Return a deep copy to ensure mutations don't affect initial data
        resolve({ data: JSON.parse(JSON.stringify(initialBookings)) });
      } else {
        resolve({ data: [] });
      }
    }, 500); // Simulate network delay
  }),

  // Simulate POST request to create a booking
  post: (url, data) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url === '/bookings/') {
        // Simple validation
        if (!data.property_id || !data.start_date || !data.end_date) {
          reject({ message: 'Missing required fields' });
        }
        const newBooking = {
          ...data,
          id: Math.floor(Math.random() * 1000) + 200, // Mock ID
          status: 'Pending',
          total_amount: Math.floor(Math.random() * 2000) + 500, // Mock amount
        };
        resolve({ data: newBooking });
      } else {
        reject({ message: 'API endpoint not found' });
      }
    }, 500);
  }),
};


// --- 2. Mock Auth Context/Hook ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const user = { 
    id: 'user-123', 
    name: 'Jane Doe', 
    email: 'jane.doe@example.com' 
  }; // Mock authenticated user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};


// --- 3. Mock Booking Modal Component ---

const BookingModal = ({ onClose, onSubmit }) => {
  const [propertyId, setPropertyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyId || !startDate || !endDate) {
      setSubmissionError('Please fill in all fields.');
      return;
    }

    const bookingData = {
      property_id: parseInt(propertyId),
      start_date: startDate,
      end_date: endDate,
    };

    setIsSubmitting(true);
    setSubmissionError('');
    try {
      await onSubmit(bookingData);
      // Close handled by parent on success
    } catch (err) {
      setSubmissionError('Failed to create booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">+</h3>
          <button onClick={onClose} className="modal-close-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {submissionError && <div className="modal-error">{submissionError}</div>}
          
          <div className="form-group">
            <label htmlFor="propertyId" className="form-label">Property ID</label>
            <input
              id="propertyId"
              type="number"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="e.g., 501"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary ${isSubmitting ? 'btn-submitting' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- 4. Booking List Component ---

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Using the mocked dependencies defined earlier in this file
  const { user } = useAuth();
  const api = mockApi; 

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      const response = await api.post('/bookings/', bookingData);
      // Prepend the new booking to the list
      setBookings([response.data, ...bookings]); 
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create booking:', err);
      // Re-throw the error so the modal component can catch and display it
      throw err;
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading bookings...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-alert" role="alert">
      <strong className="error-title">Error!</strong>
      <span className="error-message ml-2">{error}</span>
    </div>
  );

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'status-confirmed';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h2 className="bookings-title">My Bookings</h2>
        <button 
          className="btn-primary" 
          onClick={() => setIsModalOpen(true)}
        >
          New Booking
        </button>
      </div>

      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">You currently have no property bookings.</p>
            <button 
              className="empty-state-btn" 
              onClick={() => setIsModalOpen(true)}
            >
              Start a new booking
            </button>
          </div>
        ) : (
          bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="booking-card"
            >
              <div className="booking-card-info">
                {/* Booking Info */}
                <div className="booking-details-group">
                  <h3 className="booking-id-title">Booking #{booking.id}</h3>
                  <p className="property-id-text">Property ID: <span className="property-id-value">{booking.property_id}</span></p>
                </div>
                
                {/* Dates */}
                <div className="booking-dates">
                  <p className="date-text">
                    <span className="date-icon">📅</span>
                    {new Date(booking.start_date).toLocaleDateString()}
                    <span className="date-separator">to</span>
                    {new Date(booking.end_date).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Amount and Status (aligned to the right) */}
                <div className="booking-summary">
                  <span className={`status-badge ${getStatusClasses(booking.status)}`}>
                    {booking.status}
                  </span>
                  <div className="booking-amount">
                    ${booking.total_amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <BookingModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateBooking}
        />
      )}
    </div>
  );
};


// --- 5. Main App Component ---

// The main App component which serves as the entry point.
// It wraps the content in the necessary provider.
const App = () => {
  return (
    <div className="app-container">
      <AuthProvider>
        <BookingList />
      </AuthProvider>
    </div>
  );
};

export default App;