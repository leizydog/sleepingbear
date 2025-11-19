import React, { useState } from 'react';
import axios from '../../../services/api';


const BookingModal = ({ property, onClose, onSuccess }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const months = days / 30;
    return property.price_per_month * months;
  };

  const getDuration = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      setError('Please select both dates');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await axios.post('/bookings/check-availability', {
        property_id: property.id,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });

      setAvailability(response.data);
    } catch (err) {
      setError('Failed to check availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!availability?.available) {
      setError('Please check availability first');
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      await axios.post('/bookings/', {
        property_id: property.id,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });

      alert('Booking successful! Please wait for admin confirmation.');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const total = calculateTotal();
  const duration = getDuration();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Property</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Property Summary */}
          <div className="booking-property-summary">
            <div className="booking-property-image">
              {property.image_url ? (
                <img src={property.image_url} alt={property.name} />
              ) : (
                <div className="placeholder">🏢</div>
              )}
            </div>
            <div className="booking-property-info">
              <h3>{property.name}</h3>
              <p>₱{property.price_per_month.toLocaleString()}/month</p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="booking-dates">
            <div className="date-input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setAvailability(null);
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="date-input-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setAvailability(null);
                }}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {duration && (
            <div className="booking-duration">
              Duration: {duration} days
            </div>
          )}

          {/* Check Availability Button */}
          <button
            className="btn btn-secondary btn-block"
            onClick={handleCheckAvailability}
            disabled={isChecking || !startDate || !endDate}
          >
            {isChecking ? 'Checking...' : 'Check Availability'}
          </button>

          {/* Availability Result */}
          {availability && (
            <div className={`availability-result ${availability.available ? 'available' : 'unavailable'}`}>
              <span className="icon">{availability.available ? '✓' : '✗'}</span>
              {availability.message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message-box">
              {error}
            </div>
          )}

          {/* Total Amount */}
          {total && (
            <div className="booking-total">
              <span>Total Amount:</span>
              <span className="total-price">₱{total.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmBooking}
            disabled={isBooking || !availability?.available}
          >
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;