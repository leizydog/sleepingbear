import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // To read navigation state
import { useAuth } from '../../context/AuthContext';
import { propertyAPI } from '../../services/api'; // ✅ Import API
import Header from '../../components/organisms/Header';
import HomeSearchSection from '../../components/organisms/HomeSearchSection';
import FeaturedListings from '../../components/organisms/FeaturedListings';

const HomePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // ✅ STATE: Store properties from API
  const [allProperties, setAllProperties] = useState([]); 
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH DATA ON MOUNT
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // ✅ CRITICAL FIX: Explicitly ask for 'approved' status only
        const response = await propertyAPI.getAll({ 
          status_filter: 'approved',
          per_page: 100 // Fetch enough to show
        });

        // Handle pagination response structure (API returns { properties: [], total: ... })
        const properties = response.properties || response || [];
        
        // Map API data to UI structure if necessary (ensure 'id', 'image', 'location' match)
        // Assuming API returns: { id, image_url, name, address, price_per_month, ... }
        const mappedProperties = properties.map(p => ({
            id: p.id,
            image: p.image_url || 'https://via.placeholder.com/400x300?text=No+Image',
            location: p.address,
            unitType: p.name, // Or p.description depending on your model
            price: `₱${p.price_per_month?.toLocaleString()}/month`
        }));

        setAllProperties(mappedProperties);
        setFilteredProperties(mappedProperties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Effect to apply filters when page loads or search changes
  const applyFilters = (filters) => {
    if (!filters) {
        setFilteredProperties(allProperties);
        return;
    }

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
    if (location.state && location.state.filters && allProperties.length > 0) {
      applyFilters(location.state.filters);
    }
  }, [location.state, allProperties]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header isLoggedIn={!!user} />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
        {/* Search bar on this page also works */}
        <HomeSearchSection onSearch={applyFilters} />
        
        <div className="h-12"></div>
        
        {loading ? (
           <div className="text-center py-20 text-gray-500">Loading properties...</div>
        ) : (
           <FeaturedListings properties={filteredProperties} />
        )}
        
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No properties found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;