// src/components/common/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth(); 

    const userInitial = user?.full_name ? user.full_name[0].toUpperCase() : 'U';

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false); 

    const handleDropdownNavigate = (path) => {
        navigate(path);
        setIsDropdownOpen(false);
    };

    return (
        <nav className="app-navbar">
            <div className="nav-brand" onClick={() => navigate('/')}>
                <span className="logo-icon">🐻</span> 
                <span>Sleeping Bear</span>
            </div>
            
            <div className="nav-links">
                <button onClick={() => navigate('/list-place')} className="nav-link nav-link-owner">
                    List your Place
                </button>
                
                {!isAuthenticated ? (
                    <button onClick={() => navigate('/login')} className="btn btn-primary btn-login-register">
                        Login/Register
                    </button>
                ) : (
                    <div 
                        className="nav-profile-dropdown"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    >
                        <button className="profile-icon">
                            {userInitial}
                        </button>
                        
                        {isDropdownOpen && (
                            <div 
                                className="dropdown-menu aesthetic"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <p className="dropdown-user-name">
                                    Welcome, **{user?.full_name || 'User'}**
                                </p>
                                
                                <button 
                                  onClick={() => handleDropdownNavigate('/admin')} 
                                  className="dropdown-item"
                                >
                                  <span className="item-icon">🏠</span> Dashboard
                                </button>
                                
                                <button 
                                  onClick={() => logout()} 
                                  className="dropdown-item btn-logout-dropdown"
                                >
                                  <span className="item-icon">🚪</span> Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Header;