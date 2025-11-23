import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // To read navigation state
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/organisms/Header';
import HomeSearchSection from '../../components/organisms/HomeSearchSection';
import FeaturedListings from '../../components/organisms/FeaturedListings';

const HomePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Default Data
  const allProperties = [
    { id: 'PR-201', image: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e', location: '123 Pasig St., Pasig City', unitType: '2-Bedroom Condo', price: '₱25,000/month' },
    { id: 'PR-202', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', location: '456 BGC, Taguig City', unitType: 'Studio Unit', price: '₱20,000/month' },
    { id: 'PRT001', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', location: 'BGC, Taguig', unitType: 'Studio', price: '₱18,000/month' },
    { id: 'PRT002', image: 'https://images.unsplash.com/photo-1512918760383-eda2723ad13e', location: 'The Rise, Makati City', unitType: '1-Bedroom Condo', price: '₱12,000/month' },
    { id: 'PRT004', image: 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3', location: 'Antipolo', unitType: '2-Bedroom', price: '₱10,000/month' },
  ];

  const [filteredProperties, setFilteredProperties] = useState(allProperties);

  // Effect to apply filters when page loads or search changes
  const applyFilters = (filters) => {
    if (!filters) return;

    const results = allProperties.filter(prop => {
      // Filter by Location (Case insensitive match)
      const matchLoc = filters.location ? prop.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
      
      // Filter by Unit Type
      const matchType = filters.unitType ? prop.unitType.toLowerCase().includes(filters.unitType.toLowerCase()) : true;

      return matchLoc && matchType;
    });

    setFilteredProperties(results);
  };

  // Check if we came from Landing Page with filters
  useEffect(() => {
    if (location.state && location.state.filters) {
      applyFilters(location.state.filters);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header isLoggedIn={!!user} />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
        {/* Search bar on this page also works */}
        <HomeSearchSection onSearch={applyFilters} />
        
        <div className="h-12"></div>
        
        <FeaturedListings properties={filteredProperties} />
        
        {filteredProperties.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No properties found matching your criteria. Try searching for "Pasig" or "BGC".
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;