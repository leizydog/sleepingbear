import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, Home, Settings, LogOut } from 'lucide-react';

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Handle clicking outside to close menu
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const user = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  const handleLogout = () => {
    // In a real app, clear auth tokens and context state here
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* --- THE TRIGGER (Avatar + Name) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none group transition-all"
      >
        {/* Name Text */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-[#a86add] transition-colors">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 font-medium">User</p>
        </div>

        {/* The Circle Icon */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300
          ${isOpen ? 'ring-4 ring-purple-100 scale-105' : 'hover:scale-105 hover:shadow-lg'}
          bg-gradient-to-br from-[#a86add] to-[#4b0082]
        `}>
          <User size={20} />
        </div>
      </button>

      {/* --- THE DROPDOWN MENU --- */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-[100] animate-fade-in origin-top-right">
          
          {/* User Info Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2 px-2">
            
            {/* Owner Dashboard */}
            <Link 
              to="/owner/dashboard" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-[#a86add] rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={18} />
              Owner Dashboard
            </Link>

            {/* My Bookings */}
            <Link 
              to="/bookings" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-[#a86add] rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} />
              My Bookings
            </Link>

            {/* Settings (FIXED: Now links to /settings) */}
            <Link 
              to="/settings" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-[#a86add] rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-2 pb-2 px-2 mt-1">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left font-bold"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;