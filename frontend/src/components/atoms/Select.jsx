import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ options, placeholder, value, onChange, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none border border-gray-300 rounded-md px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
    </div>
  );
};

export default Select;