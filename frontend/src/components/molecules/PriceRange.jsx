import React from 'react';

const PriceRange = ({ minVal, maxVal, onMinChange, onMaxChange }) => {
  return (
    <div className="mb-8 w-full">
      <label className="block text-lg font-medium mb-2 text-black">
        Price Range:
      </label>
      
      {/* The Rounded Container */}
      <div className="flex border border-black rounded-full overflow-hidden w-full">
        
        {/* Min Input */}
        <input
          type="number"
          placeholder="MIN"
          value={minVal}
          onChange={onMinChange}
          className="flex-1 border-none text-center py-3 text-lg outline-none appearance-none placeholder-gray-500"
        />
        
        {/* Vertical Divider */}
        <div className="w-[1px] bg-black self-stretch"></div>
        
        {/* Max Input */}
        <input
          type="number"
          placeholder="MAX"
          value={maxVal}
          onChange={onMaxChange}
          className="flex-1 border-none text-center py-3 text-lg outline-none appearance-none placeholder-gray-500"
        />
      </div>
    </div>
  );
};

export default PriceRange;