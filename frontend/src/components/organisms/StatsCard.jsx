import React from 'react';
import Icon from '../atoms/Icon';

const StatsCards = ({ bookings = [] }) => {
  // 1. Safety Check: Ensure bookings is an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // 2. Calculate counts
  const total = safeBookings.length;
  const confirmed = safeBookings.filter(b => b.status && b.status.toLowerCase() === 'confirmed').length;
  const pending = safeBookings.filter(b => b.status && b.status.toLowerCase() === 'pending').length;
  const completed = safeBookings.filter(b => b.status && b.status.toLowerCase() === 'completed').length;

  const cards = [
    { label: 'Total Bookings', value: total, icon: 'Home', color: 'blue' },
    { label: 'Confirmed', value: confirmed, icon: 'CheckCircle', color: 'green' },
    { label: 'Pending', value: pending, icon: 'Clock', color: 'yellow' },
    { label: 'Completed', value: completed, icon: 'CheckCircle', color: 'indigo' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {cards.map((card, index) => (
        <div 
          key={index}
          // Dynamic border color based on the card.color prop
          className={`bg-white rounded-xl shadow-sm p-6 border-l-[6px] flex items-center justify-between
            ${card.color === 'blue' ? 'border-blue-600' : ''}
            ${card.color === 'green' ? 'border-green-500' : ''}
            ${card.color === 'yellow' ? 'border-yellow-500' : ''}
            ${card.color === 'indigo' ? 'border-indigo-600' : ''}
          `}
        >
          <div>
            <p className="text-sm text-gray-500 mb-1 font-medium">{card.label}</p>
            <p className="text-4xl font-bold text-gray-900">{card.value}</p>
          </div>
          
          {/* Circular Icon Background */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
            ${card.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
            ${card.color === 'green' ? 'bg-green-100 text-green-600' : ''}
            ${card.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : ''}
            ${card.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : ''}
          `}>
            <Icon name={card.icon} size={24} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;