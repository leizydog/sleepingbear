import React from 'react';
import Icon from '../atoms/Icon';

const StatusBadge = ({ status }) => {
  // 1. Safety Check: If status is missing, return a default "Unknown" badge
  if (!status) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-500 flex items-center w-fit gap-1">
        <Icon name="HelpCircle" size={14} />
        Unknown
      </span>
    );
  }

  const styles = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'pending approval': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    occupied: 'bg-red-100 text-red-800 border-red-200',
    
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    available: 'bg-green-50 text-green-600 border-green-200'
  };

  const icons = {
    confirmed: 'CheckCircle',
    active: 'CheckCircle',
    paid: 'CheckCircle',
    
    pending: 'Clock',
    processing: 'Loader',
    'pending approval': 'FileClock',
    
    completed: 'CheckCircle',
    
    cancelled: 'XCircle',
    occupied: 'Lock',
    
    draft: 'FileText',
    available: 'Unlock'
  };

  // Safe lowercase conversion
  const statusKey = status.toString().toLowerCase();
  
  const finalStyle = styles[statusKey] || 'bg-gray-100 text-gray-800 border-gray-200';
  const finalIcon = icons[statusKey] || 'AlertCircle';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center w-fit gap-1 capitalize ${finalStyle}`}>
      <Icon name={finalIcon} size={14} />
      {status}
    </span>
  );
};

export default StatusBadge;