import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Validate token by fetching user profile from backend
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Session expired:", error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Real Login Function (Connects to Backend)
  const login = async (credentials) => {
    try {
      // This calls the API which saves the token to localStorage
      const data = await authAPI.login(credentials);
      
      // Get the full user profile
      const loggedInUser = data.user || await authAPI.getCurrentUser();
      setUser(loggedInUser);
      
      return { success: true, role: loggedInUser.role }; 
    } catch (error) {
      console.error("Login failed:", error);
      
      // FIX: Robust error handling to prevent React Object crash
      let errorMessage = "Invalid email or password";
      const detail = error.response?.data?.detail;

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Handle FastAPI validation errors (array of objects)
        errorMessage = detail.map(err => err.msg).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        errorMessage = JSON.stringify(detail);
      }

      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // 3. Real Register Function
  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      if (data.user) setUser(data.user);
      return { success: true, role: data.user?.role };
    } catch (error) {
      // Similar safety check for registration errors
      let errorMessage = "Registration failed";
      const detail = error.response?.data?.detail;

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail.map(err => err.msg).join(', ');
      }

      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // 4. Real Logout Function
  const logout = () => {
    authAPI.logout(); // Clears local storage
    setUser(null);    // Clears state
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);