import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, Home, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/ThemeContext'; // Import your new hook

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const { isDark, toggleDarkMode } = useDarkMode(); // Use the hook
  
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

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  if (!user) return null;

  const userRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const displayName = user.full_name || user.username || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none group transition-all"
      >
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none group-hover:text-[#a86add] transition-colors">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{userRole}</p>
        </div>

        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300
          ${isOpen ? 'ring-4 ring-purple-100 dark:ring-purple-900 scale-105' : 'hover:scale-105 hover:shadow-lg'}
          bg-gradient-to-br from-[#a86add] to-[#4b0082]
        `}>
          <User size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 py-2 z-[100] animate-fade-in origin-top-right">
          
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>

          <div className="py-2 px-2">
            
            <Link 
              to="/owner/dashboard" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-[#a86add] rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={18} />
              Owner Dashboard
            </Link>

            <Link 
              to="/bookings" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-[#a86add] rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} />
              My Bookings
            </Link>

            <Link 
              to="/settings" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-[#a86add] rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              Settings
            </Link>

            {/* --- NEW: Dark Mode Toggle --- */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-[#a86add] rounded-xl transition-colors text-left"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-2 pb-2 px-2 mt-1">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left font-bold"
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