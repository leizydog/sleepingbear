import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const DarkModeContext = createContext();

// 2. Create the Provider Component
export const DarkModeProvider = ({ children }) => {
  // Initialize state: Check localStorage first, then System Preference
  const [isDark, setIsDark] = useState(() => {
    try {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            return JSON.parse(saved);
        }
        // Fallback to system preference
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    } catch (error) {
        console.log("Error reading theme preference:", error);
    }
    return false;
  });

  // Effect: Update the <html> class and save to localStorage whenever isDark changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// 3. Create the Hook
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};