import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Header from '../../components/organisms/Header';

const SettingsPage = () => {
  const { user, login } = useAuth(); // We use login to update local state if needed
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile State
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: ''
  });

  // Password State
  const [securityData, setSecurityData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Load initial user data
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // --- HANDLERS ---

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Optionally reload user context here if your AuthContext supports it
    } catch (error) {
      console.error("Update failed:", error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityData.new_password !== securityData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.changePassword({
        old_password: securityData.old_password,
        new_password: securityData.new_password
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setSecurityData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error("Password change failed:", error);
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <Header isLoggedIn={!!user} />

      <div className="max-w-4xl mx-auto px-6 py-10 pt-28">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-500 mb-8">Manage your profile information and security.</p>

        {/* Feedback Message */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* --- PROFILE CARD --- */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center gap-3 mb-6 text-gray-800">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <User size={24} />
              </div>
              <h2 className="text-xl font-bold">Profile Details</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500 transition-colors"
                  placeholder="09XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 text-gray-400 cursor-not-allowed"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Profile</>}
              </button>
            </form>
          </div>

          {/* --- SECURITY CARD --- */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center gap-3 mb-6 text-gray-800">
              <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold">Security</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={securityData.old_password}
                  onChange={(e) => setSecurityData({...securityData, old_password: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <hr className="border-gray-100 my-2" />
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                <input 
                  type="password" 
                  value={securityData.new_password}
                  onChange={(e) => setSecurityData({...securityData, new_password: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={securityData.confirm_password}
                  onChange={(e) => setSecurityData({...securityData, confirm_password: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !securityData.old_password || !securityData.new_password}
                className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Change Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;