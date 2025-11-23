import React from 'react';
import PropertyCard from '../molecules/PropertyCard';

const FeaturedListings = ({ properties }) => {
  return (
    <div className="py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Featured Listings</h2>
        <p className="text-gray-600">{properties.length} properties found matching your criteria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop) => (
          <PropertyCard 
            key={prop.id}
            image={prop.image}
            location={prop.location}
            unitType={prop.unitType}
            price={prop.price}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedListings;