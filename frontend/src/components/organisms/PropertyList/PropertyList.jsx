import React, { useState, useEffect } from 'react';
import axios from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './Properties.css';

const PropertyList = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (searchTerm = '', filterParams = {}) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        min_price: filterParams.minPrice || undefined,
        max_price: filterParams.maxPrice || undefined,
        bedrooms: filterParams.bedrooms || undefined,
      };

      const response = await axios.get('/properties', { params });
      setProperties(response.data.properties);
      setError(null);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchProperties(value, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchProperties(search, newFilters);
  };

  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', bedrooms: '' });
    fetchProperties(search, {});
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => fetchProperties()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="property-list-container">
      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filters">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="filter-input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="filter-input"
          />
          <select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            className="filter-input"
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1 BR</option>
            <option value="2">2 BR</option>
            <option value="3">3 BR</option>
            <option value="4">4+ BR</option>
          </select>
          <button onClick={clearFilters} className="btn-clear">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Property Grid */}
      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No properties found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => navigate(`/property/${property.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PropertyCard = ({ property, onClick }) => {
  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-image">
        {property.image_url ? (
          <img src={property.image_url} alt={property.name} />
        ) : (
          <div className="property-image-placeholder">
            <span>🏢</span>
          </div>
        )}
        <div className="property-badge">Available</div>
      </div>

      <div className="property-content">
        <h3 className="property-name">{property.name}</h3>
        <p className="property-address">
          <span className="icon">📍</span>
          {property.address}
        </p>

        <div className="property-details">
          <span className="detail-item">
            <span className="icon">🛏️</span>
            {property.bedrooms} BR
          </span>
          <span className="detail-item">
            <span className="icon">🚿</span>
            {property.bathrooms} BA
          </span>
          <span className="detail-item">
            <span className="icon">📐</span>
            {property.size_sqm} sqm
          </span>
        </div>

        <div className="property-footer">
          <div className="property-price">
            ₱{property.price_per_month.toLocaleString()}/mo
          </div>
          <button className="btn-view">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyList;