import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../atoms/Input';
import Label from '../atoms/Label';
import Button from '../atoms/Button';

const RegisterForm = ({ onSwitchAuth, onRegister }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <form 
      onSubmit={(e) => e.preventDefault()} 
      className="w-full max-w-[900px] bg-white rounded-[30px] px-8 md:px-12 pt-10 pb-16 relative shadow-xl mx-auto mt-10"
    >
      <h2 className="text-center text-4xl font-extrabold mb-10 text-black">Register Account</h2>

      {/* Grid Layout matching Wireframe Page 2 flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div>
            <Label>FIRST NAME</Label>
            <Input type="text" placeholder="Enter first name" />
          </div>
          <div>
            <Label>MIDDLE NAME (OPTIONAL)</Label>
            <Input type="text" placeholder="Enter middle name" />
          </div>
          <div>
            <Label>LAST NAME</Label>
            <Input type="text" placeholder="Enter last name" />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div>
            <Label>EMAIL ADDRESS</Label>
            <Input type="email" placeholder="name@example.com" />
          </div>
          <div>
            <Label>CONTACT NUMBER</Label>
            <Input type="tel" placeholder="09XX XXX XXXX" />
          </div>
          
          <div className="relative">
            <Label>PASSWORD</Label>
            <div className="relative">
              <Input 
                type={showPass ? "text" : "password"} 
                placeholder="**********" 
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="text-center mt-10 text-base">
        Already have an account?{' '}
        <Button variant="link" onClick={onSwitchAuth}>
          Login Account
        </Button>
      </div>

      <Button type="submit" variant="primary" onClick={onRegister}>
        Submit
      </Button>
    </form>
  );
};

export default RegisterForm;