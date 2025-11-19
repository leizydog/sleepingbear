import React, { useState, useEffect } from 'react';
import axios from '../../services/api';
import './Bookings.css';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/bookings/my-bookings');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirm) return;

    try {
      await axios.delete(`/bookings/${bookingId}`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchBookings} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="booking-list-container">
      <div className="booking-list-header">
        <h1>My Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No bookings yet</h3>
          <p>Start booking properties to see them here</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking, onCancel }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✓';
      case 'cancelled':
        return '✗';
      case 'completed':
        return '✓✓';
      default:
        return '•';
    }
  };

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="booking-card-item">
      <div className="booking-card-header">
        <div className={`booking-status ${booking.status}`}>
          <span>{getStatusIcon(booking.status)}</span>
          <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
        </div>
        <div className="booking-id">Booking #{booking.id}</div>
      </div>

      <div className="booking-dates-section">
        <div className="booking-date-item">
          <div className="booking-date-label">Check-in</div>
          <div className="booking-date-value">{formatDate(booking.start_date)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: '#999' }}>→</div>
        <div className="booking-date-item" style={{ textAlign: 'right' }}>
          <div className="booking-date-label">Check-out</div>
          <div className="booking-date-value">{formatDate(booking.end_date)}</div>
        </div>
      </div>

      <div className="booking-duration-badge">
        <span>⏱️</span>
        <span>{getDuration()} days</span>
      </div>

      <div className="booking-total-section">
        <div className="booking-total-label">Total Amount</div>
        <div className="booking-total-amount">
          ₱{booking.total_amount.toLocaleString()}
        </div>
      </div>

      {canCancel && (
        <div className="booking-actions">
          <button
            className="btn-cancel"
            onClick={() => onCancel(booking.id)}
          >
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingList;