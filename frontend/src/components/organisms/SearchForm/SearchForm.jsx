// src/components/organisms/SearchForm/SearchForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        unit_type: '', location: '', min_price: '', max_price: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Redirect to properties page with query parameters
        navigate(`/properties?${new URLSearchParams(searchParams).toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="search-form-homepage">
            <div className="search-inputs-row">
                <div className="input-group-search">
                    <label>Type of Unit</label>
                    <input type="text" name="unit_type" placeholder="e.g., Studio, 1-Bedroom" value={searchParams.unit_type} onChange={handleChange} />
                </div>
                <div className="input-group-search">
                    <label>Location</label>
                    <input type="text" name="location" placeholder="e.g., Makati, BGC" value={searchParams.location} onChange={handleChange} />
                </div>
                <div className="price-range-group">
                    <label>Price Range:</label>
                    <div className="price-inputs">
                        <input type="number" name="min_price" placeholder="MIN" value={searchParams.min_price} onChange={handleChange} />
                        <input type="number" name="max_price" placeholder="MAX" value={searchParams.max_price} onChange={handleChange} />
                    </div>
                </div>
                <button type="submit" className="btn btn-search">Search</button>
            </div>
        </form>
    );
};

export default SearchForm;