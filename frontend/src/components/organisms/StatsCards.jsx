import React from 'react';
import Icon from '../atoms/Icon';

const StatsCards = ({ bookings = [] }) => {
  // 1. Safety Check: Ensure bookings is an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // 2. Calculate counts based on the bookings prop
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
          // ADDED: dark:bg-gray-900 and transition classes
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border-l-[6px] flex items-center justify-between transition-colors duration-300
            ${card.color === 'blue' ? 'border-blue-600 dark:border-blue-500' : ''}
            ${card.color === 'green' ? 'border-green-500 dark:border-green-500' : ''}
            ${card.color === 'yellow' ? 'border-yellow-500 dark:border-yellow-500' : ''}
            ${card.color === 'indigo' ? 'border-indigo-600 dark:border-indigo-500' : ''}
          `}
        >
          <div>
            {/* ADDED: dark:text-gray-400 */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{card.label}</p>
            {/* ADDED: dark:text-white */}
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
          
          {/* Circular Icon Background - ADDED dark mode variants */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300
            ${card.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
            ${card.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : ''}
            ${card.color === 'yellow' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
            ${card.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}
          `}>
            <Icon name={card.icon} size={24} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;