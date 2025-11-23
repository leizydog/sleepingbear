import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MoreVertical, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';

const PropertyCard = ({ id, image, location, unitType, price }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBookNow = async () => {
    if (!user) {
      alert("Please login to book this property.");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Booking in Backend
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 1); // Default 1 year lease

      const bookingData = {
        property_id: id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      };

      const response = await bookingAPI.create(bookingData);
      
      // 2. Redirect to Payment Page with new Booking ID
      navigate('/payment', { state: { bookingId: response.data.id } });

    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
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
          disabled={loading}
          className="flex items-center gap-1 bg-white border-2 border-[#4b3b32] text-[#4b3b32] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#4b3b32] hover:text-white transition-colors uppercase tracking-wider disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <>Book Now <ChevronRight size={14} /></>}
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;