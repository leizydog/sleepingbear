import React, { useState } from 'react';
import Header from '../../components/organisms/Header';
import { useAuth } from '../../context/AuthContext';
import ThemeModule from '../../context/ThemeContext'; 
import { Info, Moon, Sun, Lock } from 'lucide-react'; // Consolidated Icons

// Destructure the hook from the imported module
const { useTheme } = ThemeModule; 

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme(); 
  
  // Placeholder user data
  const [profileData, setProfileData] = useState({
    fullName: user ? user.name : 'John Doe',
    email: user ? user.email : 'john@example.com',
    password: 'password_placeholder'
  });

  // Reusable Section Card
  const SettingsSection = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-b-4 border-purple-100 mb-8 transition-colors">
      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors">{title}</h3>
      {children}
    </div>
  );

  // --- Account Settings Form ---
  const AccountSettings = () => (
    <div className="space-y-6">
      <h4 className="font-bold text-gray-600 uppercase text-sm mb-4 dark:text-gray-400">Profile Details</h4>
      
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Full Name</label>
        <input 
          type="text" 
          value={profileData.fullName}
          onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
          className="w-full border border-gray-300 rounded-lg p-3 focus:border-[#a86add] outline-none transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Email (Read-only for security) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email Address</label>
        <input 
          type="email" 
          value={profileData.email}
          readOnly 
          className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        />
      </div>
      
      <h4 className="font-bold text-gray-600 uppercase text-sm mb-4 pt-4 border-t border-gray-100 dark:text-gray-400 dark:border-gray-700">Security</h4>

      {/* Password Change */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">New Password</label>
        <input 
          type="password" 
          placeholder="Enter new password (min 8 chars)"
          className="w-full border border-gray-300 rounded-lg p-3 focus:border-[#a86add] outline-none transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-[#a86add] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#4b0082] transition-colors">
            Save Changes
        </button>
      </div>
    </div>
  );

  // --- Appearance Settings (Dark Mode Toggle) ---
  const AppearanceSettings = () => (
    <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 transition-colors">
      <div className="flex items-center gap-3">
        {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-gray-600 dark:text-gray-300" />}
        <span className="font-medium text-gray-800 dark:text-gray-200 transition-colors">Dark Mode</span>
      </div>
      
      {/* Toggle */}
      <button 
        onClick={toggleDarkMode}
        className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
            isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
        }`}
      >
        <span className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isDarkMode ? 'translate-x-6' : 'translate-x-0'
        }`}></span>
      </button>
    </div>
  );

  // --- System Information ---
  const SystemInfo = () => (
    <div className="space-y-3 dark:text-gray-300">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Info size={18} />
            <strong>Version:</strong> v1.2.0-beta
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 pl-7">
            &copy; {new Date().getFullYear()} Sleeping Bear Property. All rights reserved.
        </p>
    </div>
  );


  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors`}>
      <Header isLoggedIn={true} />
      
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 dark:text-white transition-colors">Settings</h1>

        <div className="space-y-6">
            <SettingsSection title="Appearance">
                <AppearanceSettings />
            </SettingsSection>

            <SettingsSection title="Account & Profile">
                <AccountSettings />
            </SettingsSection>

            <SettingsSection title="System Information">
                <SystemInfo />
            </SettingsSection>
        </div>

        <div className="pt-10 flex justify-end">
             <button 
                onClick={logout} 
                className="flex items-center gap-2 text-red-600 px-6 py-3 border border-red-300 rounded-lg hover:bg-red-50 font-bold transition-colors"
             >
                <Lock size={18} />
                Logout All Sessions
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;