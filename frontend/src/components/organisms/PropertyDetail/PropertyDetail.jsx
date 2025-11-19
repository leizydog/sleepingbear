import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../services/api';
import BookingModal from '../bookings/BookingModal';
import './Properties.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/properties/${id}`);
      setProperty(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load property');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Property not found'}</p>
        <button onClick={() => navigate('/properties')} className="btn btn-primary">
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="property-detail-container">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back
      </button>

      <div className="property-detail-hero">
        {property.image_url ? (
          <img src={property.image_url} alt={property.name} />
        ) : (
          <div className="property-hero-placeholder">
            <span>🏢</span>
          </div>
        )}
      </div>

      <div className="property-detail-content">
        <div className="property-detail-main">
          <h1>{property.name}</h1>
          <p className="property-detail-price">
            ₱{property.price_per_month.toLocaleString()} per month
          </p>

          <div className="property-detail-address">
            <span className="icon">📍</span>
            {property.address}
          </div>

          <div className="property-detail-specs">
            <div className="spec-card">
              <div className="spec-icon">🛏️</div>
              <div className="spec-info">
                <div className="spec-value">{property.bedrooms}</div>
                <div className="spec-label">Bedrooms</div>
              </div>
            </div>
            <div className="spec-card">
              <div className="spec-icon">🚿</div>
              <div className="spec-info">
                <div className="spec-value">{property.bathrooms}</div>
                <div className="spec-label">Bathrooms</div>
              </div>
            </div>
            <div className="spec-card">
              <div className="spec-icon">📐</div>
              <div className="spec-info">
                <div className="spec-value">{property.size_sqm}</div>
                <div className="spec-label">Square meters</div>
              </div>
            </div>
          </div>

          <div className="property-section">
            <h2>Description</h2>
            <p>{property.description || 'No description available.'}</p>
          </div>

          <div className="property-section">
            <h2>Amenities</h2>
            <div className="amenities-list">
              <div className="amenity-item">✓ WiFi</div>
              <div className="amenity-item">✓ Parking</div>
              <div className="amenity-item">✓ 24/7 Security</div>
              <div className="amenity-item">✓ Water Supply</div>
              <div className="amenity-item">✓ Elevator</div>
            </div>
          </div>
        </div>

        <div className="property-detail-sidebar">
          <div className="booking-card">
            <div className="booking-card-price">
              ₱{property.price_per_month.toLocaleString()}
              <span>/month</span>
            </div>
            <button
              className="btn btn-primary btn-book"
              onClick={() => setShowBookingModal(true)}
              disabled={!property.is_available}
            >
              {property.is_available ? 'Book Now' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          property={property}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            navigate('/bookings');
          }}
        />
      )}
    </div>
  );
};

export default PropertyDetail;