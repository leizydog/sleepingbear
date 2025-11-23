import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import Auth

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 1. Log the user in (Set Global State)
    login({ name: 'Ann', email: 'john@example.com' });
    
    // 2. Redirect to Results Page
    navigate('/search'); 
  };

  return (
    <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[40px] px-10 py-14 shadow-2xl animate-fade-in border border-white/50">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 font-medium">Login to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="group">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Email Address</label>
          <input type="email" className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors placeholder-gray-300" placeholder="name@example.com" />
        </div>

        <div className="group relative">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Password</label>
          <input type={showPass ? "text" : "password"} className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors placeholder-gray-300" placeholder="••••••••" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 bottom-3 text-gray-400 hover:text-brand-purple">
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="pt-6">
          <button type="submit" className="w-full bg-brand-purple text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-200 hover:bg-brand-darkPurple transition-all transform hover:-translate-y-1">
            Login
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/register')} className="text-brand-purple font-bold hover:underline">Register Account</button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;