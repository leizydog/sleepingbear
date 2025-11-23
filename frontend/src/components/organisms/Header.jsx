import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react'; // Ensure ArrowLeft is imported
import AccountDropdown from './AccountDropdown';

const Header = ({ isLoggedIn = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if the current page is the Login or Register route
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleListPlace = () => {
    if (isLoggedIn) {
      navigate('/owner/add-listing');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-3 group no-underline">
        <div className="bg-[#4b0082] rounded-xl w-10 h-10 flex items-center justify-center text-white font-bold text-xl shadow-md transition-transform group-hover:scale-105 duration-300">
          🐻
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 leading-none tracking-tight font-serif">Sleeping Bear</h1>
          <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Property Rentals</p>
        </div>
      </Link>

      {/* Navigation / Back Button Logic */}
      <nav className="flex items-center gap-8">
        
        {isAuthPage ? (
          // AUTH PAGE: Show only the BACK button
          <Link 
            to="/" // Destination is the root path (Landing Page)
            className="flex items-center gap-2 text-gray-700 font-bold hover:text-[#4b0082] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        ) : (
          // STANDARD NAVIGATION
          <>
            <Link to="/search" className="text-sm font-bold text-gray-600 hover:text-[#a86add] transition-colors uppercase tracking-wide">
              Search
            </Link>
            
            <button 
              onClick={handleListPlace} 
              className="text-sm font-bold text-gray-600 hover:text-[#a86add] transition-colors uppercase tracking-wide bg-transparent border-none cursor-pointer"
            >
              List your Place
            </button>
            
            <div className="h-8 w-[1px] bg-gray-200"></div>

            {isLoggedIn ? (
              <AccountDropdown />
            ) : (
              <Link to="/login">
                <button className="bg-[#a86add] text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-[#4b0082] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Login / Register
                </button>
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;