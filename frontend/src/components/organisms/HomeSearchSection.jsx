import React, { useState } from 'react';
import { Search } from 'lucide-react';

const HomeSearchSection = ({ onSearch }) => {
  // Local state to capture inputs
  const [filters, setFilters] = useState({
    unitType: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-slide-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Start Your Search</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        {/* Unit Type */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type of Unit</label>
          <select 
            name="unitType"
            value={filters.unitType}
            onChange={handleChange}
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#a86add] focus:bg-white transition-all cursor-pointer"
          >
            <option value="">Select Unit Type</option>
            <option value="Studio">Studio</option>
            <option value="1-Bedroom">1 Bedroom</option>
            <option value="2-Bedroom">2 Bedroom</option>
            <option value="Penthouse">Penthouse</option>
          </select>
        </div>

        {/* Location */}
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
          <input 
            type="text" 
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Enter location (e.g. Pasig)" 
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#a86add] focus:bg-white transition-all" 
          />
        </div>

        {/* Price Range */}
        <div className="md:col-span-3 flex gap-3">
          <div className="w-1/2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Min Price</label>
            <input 
              type="number" 
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="0" 
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#a86add] focus:bg-white transition-all" 
            />
          </div>
          <div className="w-1/2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Price</label>
            <input 
              type="number" 
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="0" 
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#a86add] focus:bg-white transition-all" 
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="md:col-span-2">
          <button 
            onClick={() => onSearch(filters)} // Pass filters back to parent
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeSearchSection;