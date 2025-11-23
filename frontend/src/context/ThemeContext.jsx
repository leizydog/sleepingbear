import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => { // Removed 'export const'
    // 1. Initial State: Check system preference or saved preference
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem('theme') !== 'light')
    );

    // 2. Effect to apply/save preference and toggle 'dark' class on <html>
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', theme);
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext); // Removed 'export const'

// FIX: Export ThemeProvider and useTheme as a single default object
export default { ThemeProvider, useTheme };