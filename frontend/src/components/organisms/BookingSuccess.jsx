import React from 'react';
import { CheckCircle } from 'lucide-react';
import Button from '../atoms/Button';

const BookingSuccess = ({ onDownload, onHome }) => {
  return (
    <div className="bg-white rounded-[30px] shadow-xl p-10 md:p-16 max-w-3xl mx-auto mt-8 text-center border-t-8 border-[#009900]">
      
      <div className="flex justify-center mb-6">
        <CheckCircle size={100} className="text-[#009900] animate-bounce" />
      </div>

      <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
        Booking Confirmed!
      </h2>
      
      <p className="text-lg text-gray-600 mb-12">
        Your reservation has been successfully processed. <br />
        We have sent the details to your email.
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        <Button 
          variant="primary" 
          onClick={onDownload} 
          className="!relative !bottom-0 !left-0 !transform-none w-full"
        >
          DOWNLOAD RECEIPT (PDF)
        </Button>
        
        <button 
          onClick={onHome}
          className="w-full py-3 text-gray-500 font-bold hover:text-gray-800 transition-colors uppercase tracking-wider"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;