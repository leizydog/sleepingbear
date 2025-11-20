// src/components/organisms/PropertyDetail/PropertyDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingModal from '../BookingModal/BookingModal'; 

const mockProperty = {
    id: 1, name: 'Luxury 2-Bedroom Condominium', price_per_month: 35000,
    address: '456 Uptown Blvd., New City, 5678, Philippines', bedrooms: 2,
    bathrooms: 2, size_sqm: 85, is_available: true,
    description: 'A beautifully furnished two-bedroom unit located in the heart of the business district.',
    amenities: ['WiFi', 'Parking', '24/7 Security', 'Rooftop Pool'],
    image_url: 'https://via.placeholder.com/1200x500.png?text=Property+Hero+Image',
};

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setProperty(mockProperty);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) { return <div className="loading-container"><p>Loading property...</p></div>; }
    if (!property) { return <div className="error-container"><p className="error-message">Property not found</p></div>; }

    return (
        <div className="property-detail-container">
            <button onClick={() => navigate(-1)} className="btn-back">&larr; Back to Search Results</button>
            <div className="property-detail-hero">
                <img src={property.image_url} alt={property.name} className="hero-image" />
            </div>

            <div className="property-detail-content">
                <div className="property-detail-main">
                    <h1>{property.name}</h1>
                    <div className="property-detail-address"><span className="icon">📍</span>{property.address}</div>
                    <div className="property-detail-specs">
                        <div className="spec-card"><div className="spec-icon">🛏️</div><div className="spec-info"><div className="spec-value">{property.bedrooms}</div><div className="spec-label">Bedrooms</div></div></div>
                        <div className="spec-card"><div className="spec-icon">🚿</div><div className="spec-info"><div className="spec-value">{property.bathrooms}</div><div className="spec-label">Bathrooms</div></div></div>
                        <div className="spec-card"><div className="spec-icon">📐</div><div className="spec-info"><div className="spec-value">{property.size_sqm} sqm</div><div className="spec-label">Area</div></div></div>
                    </div>
                    <div className="property-section"><h2>Description</h2><p>{property.description}</p></div>
                    <div className="property-section"><h2>Amenities</h2><div className="amenities-list">
                        {property.amenities.map((a, i) => (<div key={i} className="amenity-item">✓ {a}</div>))}
                    </div></div>
                </div>

                <div className="property-detail-sidebar">
                    <div className="booking-card">
                        <p className="booking-card-price-label">Price per Month</p>
                        <div className="booking-card-price">₱{property.price_per_month.toLocaleString()}<span>/month</span></div>
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
                    onSuccess={() => { setShowBookingModal(false); navigate('/bookings'); }}
                />
            )}
        </div>
    );
};

export default PropertyDetail;