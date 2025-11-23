import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Registering...");
    // Simulate success
    navigate('/login');
  };

  return (
    <div className="w-full max-w-[800px] bg-white/95 backdrop-blur-xl rounded-[40px] px-10 py-14 shadow-2xl animate-fade-in border border-white/50">
      
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Account</h2>
        <p className="text-gray-500 font-medium">Join us to list or book properties</p>
      </div>

      <form onSubmit={handleRegister}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">First Name</label>
              <input type="text" className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" placeholder="Enter first name" />
            </div>
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Middle Name (Optional)</label>
              <input type="text" className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" placeholder="Enter middle name" />
            </div>
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Last Name</label>
              <input type="text" className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" placeholder="Enter last name" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Email Address</label>
              <input type="email" className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" placeholder="name@example.com" />
            </div>
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Contact Number</label>
              <input type="tel" className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" placeholder="09XX XXX XXXX" />
            </div>
            <div className="group relative">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Password</label>
              <input 
                type={showPass ? "text" : "password"} 
                className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-lg font-semibold text-gray-800 outline-none focus:border-brand-purple transition-colors" 
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 bottom-3 text-gray-400 hover:text-brand-purple">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-10 flex justify-center">
          <button className="w-full md:w-1/2 bg-brand-purple text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-200 hover:bg-brand-darkPurple transition-all transform hover:-translate-y-1">
            Submit
          </button>
        </div>

        {/* Login Link (THE FIX) */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className="text-brand-purple font-bold hover:underline"
            >
              Login Account
            </button>
          </p>
        </div>

      </form>
    </div>
  );
};

export default RegisterPage;