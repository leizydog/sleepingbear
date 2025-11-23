import React from 'react';
import { Check } from 'lucide-react';

const PaymentProgress = ({ step }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-12 relative px-4 font-sans">
      {/* Connecting Line */}
      <div className="absolute top-1/2 left-12 right-12 h-[3px] bg-black -z-10 transform -translate-y-1/2" />

      <div className="flex justify-between items-center text-center">
        
        {/* Step 1: Customer Info */}
        <div className="flex flex-col items-center bg-[#e6e6e6] px-2"> 
          <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center mb-2 text-lg font-bold transition-all 
            ${step === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-black text-black'}`}>
             {step > 1 ? '' : '1'} {/* Empty when passed, '1' when active */}
          </div>
          <span className="text-xs font-bold text-black">Customer Information</span>
        </div>

        {/* Step 2: Payment */}
        <div className="flex flex-col items-center bg-[#e6e6e6] px-2">
          <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center mb-2 transition-all
            ${step === 2 || step === 3 ? 'bg-[#009900] border-[#009900] text-white' : 'bg-white border-black'}`}>
            {(step === 2 || step === 3) && <Check size={24} strokeWidth={4} />}
          </div>
          <span className="text-xs font-bold text-black">Payment information</span>
        </div>

        {/* Step 3: Confirmation */}
        <div className="flex flex-col items-center bg-[#e6e6e6] px-2">
          <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center mb-2 transition-all
            ${step === 4 ? 'bg-[#009900] border-[#009900] text-white' : 'bg-white border-black'}`}>
            {step === 4 && <Check size={24} strokeWidth={4} />}
          </div>
          <span className="text-xs font-bold text-black">Booking Confirmation</span>
        </div>

      </div>
    </div>
  );
};

export default PaymentProgress;