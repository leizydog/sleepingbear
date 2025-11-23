import React from 'react';
import Icon from '../atoms/Icon';
import StatusBadge from './StatusBadge';

const BookingCard = ({ booking, onView, onDownload, onCancel }) => {
  const isConfirmed = booking.status.toLowerCase() === 'confirmed';
  const isPending = booking.status.toLowerCase() === 'pending';
  const isPaid = booking.paymentStatus.toLowerCase() === 'paid';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-6">
        {/* Top Section: Title, Location, ID, Status, Price (Keep existing structure) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          
          {/* Left: Icon & Info */}
          <div className="flex items-start gap-4">
             <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Icon name="Building" size={32} />
             </div>
             <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 m-0">{booking.propertyName}</h3>
                    <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center text-gray-500 text-sm"><Icon name="MapPin" size={16} className="mr-1.5" />{booking.location}</div>
                <div className="text-sm text-gray-400 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Icon name="Info" size={14} />Booking ID: <span className="font-mono text-gray-600">{booking.bookingId}</span></span>
                    <span>•</span>
                    <span>{booking.unitType}</span>
                </div>
             </div>
          </div>

          {/* Right: Price */}
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-bold text-blue-600 m-0">{booking.price}</p>
            <p className="text-xs text-gray-400 font-medium uppercase mt-1">Total: {booking.totalAmount}</p>
          </div>
        </div>

        {/* Middle Section: Dates & Payment Status (Keep existing structure) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-b border-gray-100">
          <div className="flex items-start gap-3"><Icon name="Calendar" size={20} className="text-blue-500 mt-1" /><div><p className="text-xs text-gray-500 mb-1">Check-in</p><p className="font-bold text-gray-900">{booking.checkIn}</p></div></div>
          <div className="flex items-start gap-3"><Icon name="Calendar" size={20} className="text-blue-500 mt-1" /><div><p className="text-xs text-gray-500 mb-1">Check-out</p><p className="font-bold text-gray-900">{booking.checkOut}</p></div></div>
          <div className="flex items-start gap-3"><Icon name="Clock" size={20} className="text-blue-500 mt-1" /><div><p className="text-xs text-gray-500 mb-1">Duration</p><p className="font-bold text-gray-900">{booking.duration}</p></div></div>
          <div className="flex items-start gap-3"><Icon name="DollarSign" size={20} className="text-blue-500 mt-1" /><div><p className="text-xs text-gray-500 mb-1">Payment Status</p><StatusBadge status={booking.paymentStatus} /></div></div>
        </div>

        {/* Bottom Section: Booked On Date & Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
          <p className="text-sm text-gray-500">
            Booked on: {booking.bookingDate}
          </p>

          <div className="flex gap-3">
            {/* 1. View Details Button */}
            <button 
                onClick={() => onView(booking.id)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              View Details
            </button>

            {/* 2. Download Receipt (Conditional on Paid/Confirmed) */}
            {(isConfirmed || isPaid) && (
              <button 
                  onClick={() => onDownload(booking)} // Pass the whole booking object
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Download Receipt
              </button>
            )}

            {/* 3. Cancel Booking (Conditional on Pending) */}
            {isPending && (
              <button 
                  onClick={() => onCancel(booking)} // Pass the whole booking object
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors shadow-sm"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;