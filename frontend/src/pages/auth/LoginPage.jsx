import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // 1. Capture Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 2. Call the backend API via Context
    const result = await login({
      email: formData.email,
      password: formData.password
    });

    setIsLoading(false);

    if (result.success) {
      // 3. Intelligent Redirect based on Role
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/search'); // Default for tenants
      }
    } else {
      // 4. Show error message if failed
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[40px] px-10 py-14 shadow-2xl animate-fade-in border border-white/50">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 font-medium">Login to your account</p>
      </div>

      {/* Error Message Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold text-center animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div className="group">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">
            Email Address
          </label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors placeholder-gray-300" 
            placeholder="name@example.com" 
          />
        </div>

        {/* Password Field */}
        <div className="group relative">
          <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">
            Password
          </label>
          <input 
            type={showPass ? "text" : "password"} 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors placeholder-gray-300 pr-10" 
            placeholder="••••••••" 
          />
          <button 
            type="button" 
            onClick={() => setShowPass(!showPass)} 
            className="absolute right-2 bottom-3 text-gray-400 hover:text-brand-purple transition-colors"
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-purple text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-200 hover:bg-brand-darkPurple transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              className="text-brand-purple font-bold hover:underline"
            >
              Register Account
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;