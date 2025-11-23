import React from 'react';
import Icon from '../atoms/Icon';

const TopBar = ({ sidebarOpen }) => {
  return (
    <div className={`bg-white fixed top-0 right-0 z-40 transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-20'}`}>
      <div className="flex items-center justify-between px-10 py-6">
        
        {/* Left: Admin Panel Badge */}
        <div className="bg-[#afa2ba] text-white px-8 py-3 rounded-full text-xl font-bold shadow-sm">
          Admin Panel
        </div>
        
        {/* Center: Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md mx-10">
          <Icon name="Search" size={24} className="text-blue-400" />
          <input 
            type="text" 
            placeholder="Search Here" 
            className="outline-none text-gray-600 placeholder-gray-400 text-lg w-full"
          />
        </div>

        {/* Right: Profile & Notifications */}
        <div className="flex items-center gap-6">
          <Icon name="MessageSquare" size={24} className="text-gray-500" />
          <div className="relative">
            <Icon name="Bell" size={24} className="text-gray-500" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="font-bold text-gray-900 text-sm">Joe Sardoma</p>
              <p className="text-xs text-gray-500 font-bold">Owner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-green-400">
               {/* Placeholder for profile image */}
               <div className="w-full h-full bg-gradient-to-b from-blue-200 to-green-200"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TopBar;