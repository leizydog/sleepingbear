import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Fixes 'useNavigate' error
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login({
      email: formData.email,
      password: formData.password
    });

    setIsLoading(false);

    if (result.success) {
      // Strict check: Only allow actual admins to use this portal
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Access Denied: You do not have administrator privileges.');
        // Optional: Logout immediately if you want to prevent tenants from "accidentally" logging in here
      }
    } else {
      setError(result.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[40px] px-10 py-14 shadow-2xl border border-white/50">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Portal</h2>
        <p className="text-gray-500 font-medium">System Administrator Access Only</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="group">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Email Address</label>
          <input 
            type="email" name="email" value={formData.email} onChange={handleChange} required
            className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" 
            placeholder="admin@sleepingbear.com" 
          />
        </div>

        <div className="group">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Password</label>
          <input 
            type="password" name="password" value={formData.password} onChange={handleChange} required
            className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" 
            placeholder="••••••••" 
          />
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Login to Dashboard'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginPage;