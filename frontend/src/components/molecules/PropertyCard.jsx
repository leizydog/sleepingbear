import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react'; 

const PropertyCard = ({ id, image, location, unitType, price }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Navigate to the new Details Page
    navigate(`/property/${id}`);
  };

  return (
    <div className="min-w-[320px] bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full">
      
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={image} 
          alt="Property" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4 flex-grow">
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{unitType}</h3>
          
          <div className="flex items-start gap-1 text-gray-500 text-sm mb-3">
            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#a86add]" />
            <span className="line-clamp-2">{location}</span>
          </div>
        </div>

        {/* Price and Button Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rent</p>
            <p className="text-[#a86add] font-extrabold text-lg">{price}</p>
          </div>
          
          <button 
            onClick={handleViewDetails} 
            className="bg-[#3a2a22] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#a86add] transition-colors flex items-center gap-2 group-hover:shadow-lg"
          >
            View Details <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;