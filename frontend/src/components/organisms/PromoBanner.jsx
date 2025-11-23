import React from 'react';
import { ChevronRight } from 'lucide-react';

const PromoBanner = () => {
  return (
    <div className="w-full bg-[#3a2a22] rounded-[30px] overflow-hidden flex flex-col md:flex-row relative mt-8 min-h-[300px]">
      {/* Left Text Content */}
      <div className="p-10 md:p-16 flex flex-col justify-center z-10 md:w-1/2">
        <h2 className="text-5xl md:text-7xl font-normal text-white leading-tight mb-2">
          NEW
        </h2>
        <h2 className="text-5xl md:text-7xl font-normal text-white leading-tight">
          BUILD HOMES
        </h2>
      </div>

      {/* Right Image Content */}
      <div className="md:w-1/2 h-64 md:h-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3a2a22] via-transparent to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop" 
          alt="New Build Homes" 
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrow */}
        <button className="absolute bottom-8 right-8 bg-[#cfaa7f] text-[#3a2a22] rounded-full p-2 z-20 hover:bg-white transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;