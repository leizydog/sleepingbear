import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import Auth

const PropertyCard = ({ image, location, unitType, price }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user status

  const handleBookNow = () => {
    if (user) {
      // Scenario 1: User is Logged In -> Go to Payment
      navigate('/payment');
    } else {
      // Scenario 2: User is Guest -> Go to Login
      alert("Please login to book this property.");
      navigate('/login');
    }
  };

  return (
    <div className="min-w-[320px] bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative group">
      <button className="absolute top-6 right-6 z-10 text-white hover:text-gray-200 bg-black/20 rounded-full p-1">
        <MoreVertical size={20} />
      </button>

      <div className="h-48 w-full rounded-xl overflow-hidden mb-4">
        <img src={image} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>

      <div className="space-y-1 mb-6">
        <p className="text-xs font-bold text-gray-900">Location: <span className="font-normal text-gray-600">{location}</span></p>
        <p className="text-xs font-bold text-gray-900">Unit Type: <span className="font-normal text-gray-600">{unitType}</span></p>
        <p className="text-xs font-bold text-gray-900">Price: <span className="font-normal text-gray-600">{price}</span></p>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleBookNow} 
          className="flex items-center gap-1 bg-white border-2 border-[#4b3b32] text-[#4b3b32] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#4b3b32] hover:text-white transition-colors uppercase tracking-wider"
        >
          Book Now <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;