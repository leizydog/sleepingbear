import React from 'react';

const Label = ({ children, className = '' }) => {
  return (
    <label className={`block font-extrabold text-sm uppercase mb-1 text-black ${className}`}>
      {children}
    </label>
  );
};

export default Label;