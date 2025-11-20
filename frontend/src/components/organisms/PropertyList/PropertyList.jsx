// src/components/organisms/PropertyList/PropertyList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../common/Header'; 
import SearchForm from '../SearchForm/SearchForm';

const mockProperties = [
    { id: 1, image_url: 'property_1.jpg', location: '123 Anywhere St., Any City St., 1234', unit_type: '1-Bedroom Condominium', price_per_month: 5000 },
    { id: 2, image_url: 'property_2.jpg', location: '456 Uptown Blvd., New City, 5678', unit_type: '2-Bedroom Apartment', price_per_month: 25000 },
    { id: 3, image_url: 'property_3.jpg', location: '789 Garden Rd., Suburbia, 9012', unit_type: 'Studio Type', price_per_month: 12000 },
];

const PropertyList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProperties(mockProperties);
            setLoading(false);
        }, 500);
    }, [searchParams]);

    if (loading) {
        return <div className="loading-container"><p>Loading search results...</p></div>;
    }

    const handleBookNow = (propertyId) => {
        navigate(`/property/${propertyId}`); 
    };

    return (
        <div className="property-list-page-wrapper">
            <Header />
            <div className="property-list-content">
                <div className="property-list-search-bar">
                    <SearchForm /> {/* Re-usable search form */}
                    <p className="results-count">Results: {properties.length}</p>
                </div>

                <div className="property-list-grid">
                    {properties.map((property) => (
                        <div key={property.id} className="property-card">
                            <div className="card-image"><span className="image-placeholder">🏠</span></div>
                            <div className="card-details">
                                <p className="card-location"><span className="icon">📍</span> Location: {property.location}</p>
                                <p className="card-unit-type">Unit Type: {property.unit_type}</p>
                                <p className="card-price">Price: ₱{property.price_per_month.toLocaleString()}/month</p>
                                <button onClick={() => handleBookNow(property.id)} className="btn btn-book-now">
                                    BOOK NOW &gt;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PropertyList;