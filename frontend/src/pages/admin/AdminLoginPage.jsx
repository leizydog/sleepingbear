import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleAdminLogin = (e) => {
    e.preventDefault();
    console.log("Attempting Admin Login...");
    // Simulate Admin login success and redirect to Admin Dashboard
    navigate('/admin/dashboard'); 
  };

  return (
    <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[40px] px-10 py-14 shadow-2xl animate-fade-in border border-white/50">
      
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Admin Login</h2>
        <p className="text-gray-500 font-medium">Use your administrator credentials</p>
      </div>

      <form onSubmit={handleAdminLogin} className="space-y-6">
        
        {/* USERNAME Field */}
        <div className="group">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">USERNAME</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors placeholder-gray-300" 
            placeholder="Enter username"
            required
          />
        </div>

        {/* PASSWORD Field */}
        <div className="group relative">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">PASSWORD</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors placeholder-gray-300" 
            placeholder="••••••••"
            required
          />
        </div>

        {/* Login Button */}
        <div className="pt-8">
          <button type="submit" className="w-full bg-[#4b0082] text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-brand-purple transition-all transform hover:-translate-y-1">
            Login
          </button>
        </div>

        {/* Placeholder for recovery/help */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-sm">
            <a href="#" className="hover:underline">Contact support for access.</a>
          </p>
        </div>

      </form>
    </div>
  );
};

export default AdminLoginPage;