import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../atoms/Input';
import Label from '../atoms/Label';
import Button from '../atoms/Button';

const LoginForm = ({ onSwitchAuth, onLogin }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <form 
      onSubmit={(e) => e.preventDefault()} 
      // Added 'animate-fade-in' and increased shadow/padding for premium feel
      className="w-full max-w-[500px] bg-white rounded-[40px] px-10 md:px-14 pt-12 pb-20 relative shadow-2xl mx-auto mt-8 animate-fade-in border border-white/50"
    >
      <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-12 text-gray-900 tracking-tight">
        Login Account
      </h2>

      {/* Email Field */}
      <div className="mb-10 group">
        <Label className="group-focus-within:text-[#a86add] transition-colors">
          EMAIL ADDRESS
        </Label>
        <Input 
          type="email" 
          placeholder="name@example.com" 
        />
      </div>

      {/* Password Field */}
      <div className="mb-12 relative group">
        <Label className="group-focus-within:text-[#a86add] transition-colors">
          PASSWORD
        </Label>
        <div className="relative">
          <Input 
            type={showPass ? "text" : "password"} 
            placeholder="**********" 
          />
          <button 
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-0 bottom-3 text-gray-400 hover:text-[#a86add] transition-colors border-none bg-transparent cursor-pointer"
          >
            {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>
      </div>

      {/* Switch Auth Link */}
      <div className="text-center mb-4 text-gray-600 text-sm font-medium">
        Dont have an account?{' '}
        <Button variant="link" onClick={onSwitchAuth}>
          Register Account
        </Button>
      </div>

      {/* Submit Button (Floating Purple Pill) */}
      <Button type="submit" variant="primary" onClick={onLogin}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;