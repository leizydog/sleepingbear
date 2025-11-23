import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import PaymentProgress from '../molecules/PaymentProgress';

const PaymentForm = ({ onNext }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [agreed, setAgreed] = useState(false);

  const methods = [
    { id: 'BPI', label: 'BPI' },
    { id: 'GCASH', label: 'GCASH' },
    { id: 'CASH', label: 'CASH' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#e6e6e6] min-h-screen pt-10 pb-20 px-4">
      {/* 1. Progress Bar */}
      <PaymentProgress />

      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-3xl font-extrabold text-black mb-8">
          Select Payment Method:
        </h2>

        {/* 2. Payment Options (Thick Borders) */}
        <div className="space-y-6 mb-10">
          {methods.map((method) => (
            <div 
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className="cursor-pointer"
            >
              <div className={`
                relative flex items-center px-6 py-4 
                bg-white border-[3px] border-black rounded-xl
                transition-all duration-200
                ${selectedMethod === method.id ? 'shadow-lg bg-gray-50' : ''}
              `}>
                {/* Custom Radio Circle */}
                <div className={`
                  w-8 h-8 rounded-full border-[3px] border-black mr-6 flex items-center justify-center
                  ${selectedMethod === method.id ? 'bg-black' : 'bg-white'}
                `}>
                  {selectedMethod === method.id && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
                
                {/* Label */}
                <span className="text-2xl font-bold text-black uppercase">
                  {method.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Security Note */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 text-gray-800 font-bold text-lg mb-1">
            <Lock size={20} />
            <span>Secure Payment</span>
          </div>
          <p className="text-sm text-gray-600">
            All card information is fully encrypted, secure, and protected
          </p>
        </div>

        {/* 4. Next Button (Purple Pill) */}
        <button
          onClick={onNext}
          disabled={!selectedMethod || !agreed}
          className={`
            w-full py-4 rounded-xl text-white font-bold text-xl tracking-wider shadow-md transition-all
            ${(!selectedMethod || !agreed) ? 'bg-purple-300 cursor-not-allowed' : 'bg-[#a86add] hover:bg-[#965ac9]'}
          `}
        >
          NEXT
        </button>

        {/* 5. Terms Checkbox (Centered below button) */}
        <div className="flex justify-center items-center mt-6">
          <div 
            onClick={() => setAgreed(!agreed)}
            className={`
              w-8 h-8 border-[3px] border-black cursor-pointer mr-3 flex items-center justify-center bg-white
              ${agreed ? 'bg-black' : ''}
            `}
          >
            {agreed && <Check className="text-white" size={20} strokeWidth={4} />}
          </div>
          <span className="text-lg font-medium text-black">
            I agree to the Terms and Conditions
          </span>
        </div>

      </div>
    </div>
  );
};

// Tiny helper for checkbox checkmark
const Check = ({ size, color, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default PaymentForm;