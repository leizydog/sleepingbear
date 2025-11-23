import React from 'react';
import { Check } from 'lucide-react';

const ListingProgress = ({ step = 1 }) => {
  // Helper for styles (Green for active/completed, white for future)
  const getStepStyle = (stepNum) => {
    if (stepNum < step) return 'bg-[#009900] border-[#009900] text-white'; // Completed
    if (stepNum === step) return 'bg-[#009900] border-[#009900] text-white shadow-lg scale-110'; // Active
    return 'bg-white border-black text-transparent'; // Inactive
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 relative px-4">
      {/* Connecting Line */}
      <div className="absolute top-5 left-12 right-12 h-[3px] bg-black -z-10" />

      <div className="flex justify-between items-start text-center">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center mb-2 transition-all duration-300 ${getStepStyle(1)}`}>
            <Check size={24} strokeWidth={4} />
          </div>
          <span className="text-sm font-bold text-black">Details</span>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center mb-2 transition-all duration-300 ${getStepStyle(2)}`}>
            <Check size={24} strokeWidth={4} />
          </div>
          <span className="text-sm font-bold text-black">Payment Method</span>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center mb-2 transition-all duration-300 ${getStepStyle(3)}`}>
            <Check size={24} strokeWidth={4} />
          </div>
          <span className="text-sm font-bold text-black">Publish Confirmation</span>
        </div>
      </div>
    </div>
  );
};

export default ListingProgress;