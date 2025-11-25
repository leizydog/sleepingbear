import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Dark Mode Context
const DarkModeContext = createContext();

// Dark Mode Provider Component
export const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Get saved preference from localStorage
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Custom hook to use dark mode
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export default DarkModeContext;