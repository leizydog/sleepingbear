import React from 'react';
import Icon from '../atoms/Icon'; // Using your new Icon atom

const SearchBar = ({ icon, placeholder, value, onChange }) => {
  return (
    <div className="relative mb-5 w-full">
      {/* Icon positioned absolute left */}
      <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-black">
        <Icon name={icon} size={24} />
      </div>
      
      {/* Rounded Input */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-black rounded-full py-3 pl-14 pr-4 text-lg outline-none text-gray-700 placeholder-gray-500 transition-shadow focus:shadow-md"
      />
    </div>
  );
};

export default SearchBar;