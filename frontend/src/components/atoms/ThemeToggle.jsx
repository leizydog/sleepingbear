import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#a86add] dark:hover:text-[#a86add] ${className}`}
            aria-label="Toggle Dark Mode"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

export default ThemeToggle;
