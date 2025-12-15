import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api'; // Use API directly to avoid auto-login context

const RegisterPage = () => {
  const navigate = useNavigate();

  // 1. State for all form fields
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });

  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) return `${fieldName} is required`;
    if (!/^[a-zA-Z\s]+$/.test(name)) return `${fieldName} must contain letters only`;
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Contact number is required';
    if (!/^[0-9]+$/.test(phone)) return 'Phone must contain numbers only';
    if (phone.length !== 11) return 'Phone must be exactly 11 digits';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8 || password.length > 12) return 'Password must be 8-12 characters';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return '';
  };

  // Generic change handler with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');

    // Real-time validation
    let fieldError = '';
    switch (name) {
      case 'firstName': fieldError = validateName(value, 'First name'); break;
      case 'lastName': fieldError = validateName(value, 'Last name'); break;
      case 'email': fieldError = validateEmail(value); break;
      case 'phone': fieldError = validatePhone(value); break;
      case 'password': fieldError = validatePassword(value); break;
      default: break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  // Validate all fields before submit
  const validateAllFields = () => {
    const errors = {
      firstName: validateName(formData.firstName, 'First name'),
      lastName: validateName(formData.lastName, 'Last name'),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password)
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(err => err !== '');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate all fields first
    if (!validateAllFields()) {
      setError('Please fix the errors above before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');

    // 2. Combine names for the backend
    const fullName = [
      formData.firstName.trim(),
      formData.middleName.trim(),
      formData.lastName.trim()
    ].filter(Boolean).join(' ');

    // 3. Prepare payload
    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      full_name: fullName,
      phone: formData.phone.trim(),
      role: 'tenant', // Default role
      username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000) // Generate unique username
    };

    try {
      // 4. Call API directly (Does not auto-login)
      await authAPI.register(payload);

      // 5. Redirect to Login on Success
      alert("Registration successful! Please login.");
      navigate('/login');

    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[800px] bg-white/95 backdrop-blur-xl rounded-[40px] px-10 py-14 shadow-2xl animate-fade-in border border-white/50">

      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Account</h2>
        <p className="text-gray-500 font-medium">Join us to list or book properties</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold text-center animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Names */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={`w-full border-b-2 ${fieldErrors.firstName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-transparent py-2 text-lg font-semibold text-gray-800 dark:text-white outline-none focus:border-brand-purple transition-colors`}
                placeholder="Enter first name"
              />
              {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.firstName}</p>}
            </div>
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Middle Name (Optional)</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-2 text-lg font-semibold text-gray-800 dark:text-white outline-none focus:border-brand-purple transition-colors"
                placeholder="Enter middle name"
              />
            </div>
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={`w-full border-b-2 ${fieldErrors.lastName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-transparent py-2 text-lg font-semibold text-gray-800 dark:text-white outline-none focus:border-brand-purple transition-colors`}
                placeholder="Enter last name"
              />
              {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.lastName}</p>}
            </div>
          </div>

          {/* Right Column: Contact & Auth */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full border-b-2 ${fieldErrors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-transparent py-2 text-lg font-semibold text-gray-800 dark:text-white outline-none focus:border-brand-purple transition-colors`}
                placeholder="name@example.com"
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.email}</p>}
            </div>
            <div className="group">
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Contact Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`w-full border-b-2 ${fieldErrors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-transparent py-2 text-lg font-semibold text-gray-800 dark:text-white outline-none focus:border-brand-purple transition-colors`}
                placeholder="09XX XXX XXXX"
              />
              {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.phone}</p>}
            </div>
            <div className="group relative">
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase mb-2 group-focus-within:text-brand-purple transition-colors">Password</label>
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full border-b-2 ${fieldErrors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-transparent py-2 text-lg font-semibold text-gray-800 dark:text-white outline-none focus:border-brand-purple transition-colors pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 bottom-3 text-gray-400 hover:text-brand-purple"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.password}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-10 flex justify-center">
          <button
            disabled={isLoading}
            className="w-full md:w-1/2 bg-brand-purple text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-200 hover:bg-brand-darkPurple transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>

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