import React from 'react';
import PropertyCard from '../molecules/PropertyCard';

const FeaturedListings = ({ properties }) => {
  return (
    <div className="py-10">
      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-400">{properties.length} properties found matching your criteria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop) => (
          <PropertyCard
            key={prop.id}
            id={prop.id}  // <--- CRITICAL FIX: Pass the ID here!
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