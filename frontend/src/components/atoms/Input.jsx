import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', variant = 'flushed', ...props }) => {
  
  const baseClasses = "w-full bg-transparent text-gray-900 outline-none transition-all duration-300 placeholder-gray-400";
  
  const variants = {
    // Underlined style (Used in Login/Register)
    flushed: "border-b-2 border-gray-200 py-3 focus:border-brand-purple text-lg font-semibold",
    
    // Bordered style (Simplified Focus Ring for Stability)
    bordered: "border-2 border-gray-200 rounded-xl p-3 text-lg focus:border-brand-purple" 
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${baseClasses} ${variants[variant] || variants.flushed} ${className}`}
      {...props}
    />
  );
};

export default Input;