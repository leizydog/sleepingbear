import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Updated path
import api from '../../../services/api'; // Updated path
import BookingModal from '../BookingModal/BookingModal'; // Updated path to sibling organism
import './Bookings.css';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/');
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      const response = await api.post('/bookings/', bookingData);
      setBookings([...bookings, response.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create booking:', err);
      throw err;
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h2>My Bookings</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          New Booking
        </button>
      </div>

      <div className="bookings-list">
        {bookings.length === 0 ? (
          <p className="no-bookings">No bookings found.</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <h3>Booking #{booking.id}</h3>
                <p>Property ID: {booking.property_id}</p>
                <p>
                  {new Date(booking.start_date).toLocaleDateString()} -{' '}
                  {new Date(booking.end_date).toLocaleDateString()}
                </p>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-amount">
                ${booking.total_amount}
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

export default BookingList;