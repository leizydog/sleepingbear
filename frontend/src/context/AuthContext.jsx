import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user state (null = guest, object = logged in)
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData || { name: 'John Doe', email: 'john@example.com' });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);