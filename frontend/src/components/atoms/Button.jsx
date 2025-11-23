import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', variant = 'primary' }) => {
  const baseStyle = "font-medium transition-all duration-300 ease-in-out transform flex items-center justify-center";
  
  const variants = {
    // Purple Pill (Login/Register/Old Search)
    primary: "bg-[#a86add] text-white rounded-full px-10 py-3 text-lg shadow-lg hover:bg-[#965ac9] hover:-translate-y-1",
    
    // NEW Blue Rectangle (Search/Header)
    blue: "bg-blue-600 text-white rounded-md px-6 py-3 hover:bg-blue-700 shadow-md hover:shadow-lg",
    
    // Link style
    link: "text-black underline bg-transparent p-0 border-none cursor-pointer font-bold hover:text-[#a86add]"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;