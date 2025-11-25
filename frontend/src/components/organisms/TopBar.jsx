import React from 'react';
import Icon from '../atoms/Icon';

const TopBar = ({ sidebarOpen }) => {
  return (
    <header 
      className={`
        fixed top-0 right-0 z-30 
        bg-white/95 backdrop-blur-sm border-b border-gray-200 
        transition-[left] duration-300 ease-in-out
        h-20 flex items-center
        ${sidebarOpen ? 'left-72' : 'left-20'}
      `}
    >
      <div className="flex items-center justify-between w-full px-8">
        
        {/* Left: Page Title / Badge */}
        <div className="flex items-center gap-4">
            <div className="bg-[#a86add]/10 text-[#a86add] px-5 py-2 rounded-xl text-sm font-extrabold uppercase tracking-wider">
                Admin Panel
            </div>
        </div>
        
        {/* Center: Search Bar (Modernized) */}
        <div className="flex-1 max-w-lg mx-12">
            <div className="flex items-center gap-3 bg-gray-100 px-4 py-2.5 rounded-2xl focus-within:ring-2 focus-within:ring-[#a86add]/20 transition-all">
                <Icon name="Search" size={20} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search properties, bookings..." 
                    className="bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm w-full font-medium"
                />
            </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-6">
          
          {/* Icons */}
          <div className="flex items-center gap-4 border-r border-gray-200 pr-6">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#a86add]">
                <Icon name="MessageSquare" size={20} />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#a86add]">
                <Icon name="Bell" size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
          
          {/* Profile Section */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="font-bold text-gray-900 text-sm leading-tight">Joe Sardoma</p>
              <p className="text-xs text-gray-500 font-semibold">Owner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-[#a86add]">
               {/* Replace src with actual user image variable if available */}
               <img 
                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=Joe" 
                 alt="Profile" 
                 className="w-full h-full object-cover"
               />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

export default TopBar;