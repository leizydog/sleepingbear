import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 
import AccountDropdown from './AccountDropdown';

// IMPORT LOGO
import logo from '../../assets/logo.jpg'; 

const Header = ({ isLoggedIn = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleListPlace = () => {
    if (isLoggedIn) {
      navigate('/owner/add-listing');
    } else {
      navigate('/login');
    }
  };

  return (
    // CHANGE: Replaced 'sticky' with 'fixed top-0 left-0 w-full' to make it stable
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-3 bg-white/90 backdrop-blur-md border-b border-gray-100 z-[100] shadow-sm transition-all duration-300">
      
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-4 group no-underline">
        <img 
            src={logo} 
            alt="Sleeping Bear Logo" 
            className="w-14 h-14 rounded-2xl object-cover shadow-md transition-transform group-hover:scale-105 duration-300"
        />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-none tracking-tight font-serif">Sleeping Bear</h1>
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mt-1">Property Rentals</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-8">
        {isAuthPage ? (
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-700 font-bold hover:text-[#4b0082] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        ) : (
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