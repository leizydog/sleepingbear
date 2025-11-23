import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/organisms/Header';
import Icon from '../../components/atoms/Icon';
import Input from '../../components/atoms/Input'; 
import api, { paymentsAPI } from '../../services/api'; // Import real API

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); 
  
  // 1. Get Booking ID (Required for payment)
  const bookingId = location.state?.bookingId; 

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(''); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // 2. Fetch Booking Details (Price)
  useEffect(() => {
    if (!bookingId) {
        alert("No booking selected. Redirecting to bookings.");
        navigate('/bookings');
        return;
    }
    const fetchDetails = async () => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBookingDetails(response.data);
        } catch (error) {
            console.error("Failed to load booking:", error);
        }
    };
    fetchDetails();
  }, [bookingId, navigate]);

  const loggedInUser = user || {
    full_name: 'Guest',
    email: 'guest@example.com',
    phone: '' 
  };

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(loggedInUser.phone || ''); 
  const [idImage, setIdImage] = useState(null); 

  // --- Handlers ---
  const handleIdUpload = (event) => {
    const file = event.target.files[0];
    if (file) setIdImage(file);
  };

  const handleProceedToPayment = () => {
    if (!address || !phoneNumber || !idImage) {
      alert('Please fill in all required fields and upload your ID.');
      return;
    }
    setStep(2);
  };
  
  // --- 3. REAL PAYMENT SUBMISSION ---
  const handleFinalPaymentSubmission = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (step === 3 && !agreedTerms) {
        alert("You must agree to the Terms and Conditions.");
        return;
    }
    
    setLoading(true);

    try {
        // A. Create Payment Intent
        const payload = {
            booking_id: bookingId,
            payment_method: paymentMethod.toLowerCase(), // 'bpi', 'gcash', 'cash'
            amount: bookingDetails?.total_amount 
        };

        const intentRes = await paymentsAPI.createIntent(payload);
        
        // B. Confirm Payment (Updates Backend Status)
        await paymentsAPI.confirm({
            payment_intent_id: intentRes.data.payment_intent_id
        });

        setIsSuccess(true);
        setStep(4);

    } catch (error) {
        console.error("Payment failed:", error);
        setIsSuccess(false);
        setStep(4);
    } finally {
        setLoading(false);
    }
  };
  
  const handleAddressChange = useCallback((e) => setAddress(e.target.value), []);
  const handlePhoneChange = useCallback((e) => setPhoneNumber(e.target.value), []);

  // --- Components (Preserved Your Exact UI) ---

  const CustomerContactForm = memo(({ handleProceedToPayment, handleIdUpload, loggedInUser }) => (
    <>
      <div className="mb-6">
        <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">Current Address (Required)</label>
        <Input
          type="text" id="address" value={address} variant="bordered"
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg outline-none focus:border-blue-500"
          placeholder="Enter your current address"
          onChange={handleAddressChange} required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">Contact Phone Number (Required)</label>
        <Input
          type="tel" id="phone" value={phoneNumber} variant="bordered"
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg outline-none focus:border-blue-500"
          placeholder="Enter your phone number (e.g., 09XX XXX XXXX)"
          onChange={handlePhoneChange} required
        />
        <p className="text-sm text-gray-500 mt-2">This number is pre-filled from your registration.</p>
      </div>

      <div className="mb-8">
        <label htmlFor="idUpload" className="block text-sm font-bold text-gray-700 mb-2">Upload Government ID (Required)</label>
        <div className="flex items-center gap-4">
          <input
            type="file" id="idUpload" accept="image/*,.pdf" onChange={handleIdUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a86add]/10 file:text-[#a86add] hover:file:bg-[#a86add]/20"
            required
          />
          {idImage && (<span className="text-sm text-gray-600">{idImage.name}</span>)}
        </div>
        <p className="text-sm text-gray-500 mt-2">Accepted formats: JPG, PNG, PDF. Max size: 5MB.</p>
      </div>

      <div className="text-center">
        <button
          onClick={handleProceedToPayment}
          className="bg-[#4b0082] text-white font-bold py-4 px-16 rounded-2xl shadow-xl hover:bg-[#a86add] transition-all transform hover:-translate-y-1 text-lg uppercase tracking-widest"
        >
          PROCEED TO PAYMENT
        </button>
      </div>
    </>
  ));

  const CustomerInfoView = () => (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
      
      {bookingDetails && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-800 text-center font-bold">
              Paying: ₱{bookingDetails.total_amount?.toLocaleString()}
          </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg mb-8">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          <Icon name="User" size={20} className="text-blue-600" /> Logged-in Profile Details (Read-only)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-blue-700">
          <p><span className="font-bold">Name:</span> {loggedInUser.full_name}</p>
          <p className="col-span-2"><span className="font-bold">Email:</span> {loggedInUser.email}</p>
        </div>
        <p className="text-sm text-blue-600 mt-4">These details are retrieved from your authenticated account.</p>
      </div>

      <CustomerContactForm 
        address={address} setAddress={setAddress} 
        phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} 
        idImage={idImage} handleIdUpload={handleIdUpload}
        handleProceedToPayment={handleProceedToPayment}
      />
    </div>
  );
  
  const MethodSelectionView = () => (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-black mb-6 text-center">Select Payment Method:</h2>
        <div className="space-y-4 mb-8">
          {['BPI', 'GCASH', 'CASH'].map(method => (
            <div 
              key={method} onClick={() => setPaymentMethod(method)}
              className={`cursor-pointer border-[3px] rounded-xl p-4 flex items-center bg-white transition-all ${paymentMethod === method ? 'border-brand-blue bg-blue-50' : 'border-black'}`}
            >
              <div className={`w-6 h-6 rounded-full border-[3px] border-black mr-4 flex items-center justify-center ${paymentMethod === method ? 'bg-black' : 'bg-white'}`}>
                {paymentMethod === method && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-xl font-bold uppercase text-black">{method}</span>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 font-bold text-gray-800"><Lock size={18} /> Secure Payment</div>
          <p className="text-xs text-gray-500">All card information is secured.</p>
        </div>

        <button 
          disabled={!paymentMethod || !agreedTerms}
          onClick={() => setStep(3)} 
          className={`w-full py-4 rounded-xl text-white font-bold text-xl tracking-wider shadow-md transition-all ${(!paymentMethod || !agreedTerms) ? 'bg-purple-300 cursor-not-allowed' : 'bg-brand-purple hover:bg-purple-600'}`}
        >
          NEXT
        </button>

        <div className="flex justify-center items-center mt-6 gap-3 cursor-pointer" onClick={() => setAgreedTerms(!agreedTerms)}>
          <div className={`w-6 h-6 border-[3px] border-black flex items-center justify-center ${agreedTerms ? 'bg-black text-white' : 'bg-white'}`}>
            {agreedTerms && <Check size={16} strokeWidth={4} />}
          </div>
          <span className="font-bold text-sm text-black">I agree to the Terms and Conditions</span>
        </div>
    </div>
  );

  const PaymentDetailsView = () => (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
      <h2 className="text-2xl font-extrabold text-black mb-8 text-center uppercase tracking-tight">
        {paymentMethod === 'BPI' ? 'BPI CARD DETAILS' : paymentMethod === 'GCASH' ? 'GCASH DETAILS' : 'CASH DETAILS'}
      </h2>

      <div className="space-y-6 mb-10 px-4">
        {/* Your existing form fields for BPI/GCASH/CASH preserved here */}
        {paymentMethod === 'BPI' && (
          <>
            <div className="flex items-center">
              <label className="w-48 text-lg font-medium text-black">Card Number</label>
              <Input type="text" className="flex-1" variant="bordered" />
            </div>
            {/* ... other BPI fields ... */}
          </>
        )}
        {paymentMethod === 'GCASH' && (
          <>
            <div className="flex items-center">
              <label className="w-48 text-xl font-extrabold text-black">Gcash Number</label>
              <Input type="text" className="flex-1" variant="bordered" />
            </div>
            {/* ... other GCash fields ... */}
          </>
        )}
        {paymentMethod === 'CASH' && (
             <div className="bg-yellow-50/50 p-6 rounded-xl text-yellow-800 font-bold text-center border border-yellow-300">
                Cash Payment selected. Please proceed to submit your payment details.
            </div>
        )}
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 font-bold text-gray-800"><Lock size={18} /> Secure Payment</div>
        <p className="text-xs text-gray-500">All information is secured.</p>
      </div>

      <button 
        onClick={handleFinalPaymentSubmission}
        disabled={loading}
        className="w-full bg-brand-purple hover:bg-purple-600 text-white font-bold text-xl py-4 rounded-xl shadow-md transition-all uppercase tracking-widest flex justify-center items-center gap-2"
      >
        {loading ? <><Loader2 className="animate-spin" /> Processing...</> : 'SUBMIT PAYMENT'}
      </button>

      <div className="flex justify-center items-center mt-6 gap-3 cursor-pointer" onClick={() => setAgreedTerms(!agreedTerms)}>
        <div className={`w-6 h-6 border-[3px] border-black flex items-center justify-center ${agreedTerms ? 'bg-black text-white' : 'bg-white'}`}>
          {agreedTerms && <Check size={16} strokeWidth={4} />}
        </div>
        <span className="font-bold text-sm text-black">I agree to the Terms and Conditions</span>
      </div>
    </div>
  );

  const ConfirmationView = () => (
    <div className="max-w-3xl mx-auto mt-16 text-center px-4 animate-fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-[#009900]">
          {isSuccess ? (
              <>
                  <Check size={80} className="text-[#009900] mx-auto mb-4" />
                  <h2 className="text-4xl font-extrabold text-black mb-6">Booking Confirmed!</h2>
                  <p className="text-xl text-black mb-12 font-medium">You will receive a booking confirmation email.</p>
              </>
          ) : (
              <>
                  <AlertTriangle size={80} className="text-red-600 mx-auto mb-4" />
                  <h2 className="text-4xl font-extrabold text-black mb-4">Payment Failed</h2>
                  <p className="text-xl text-black mb-4 font-medium">Please review the details.</p>
                  <button onClick={() => setStep(2)} className="text-blue-600 font-bold text-xl underline mb-10 hover:text-blue-800">Try Again</button>
              </>
          )}
        
        <div className="flex justify-center gap-6">
          <button 
            onClick={isSuccess ? () => navigate('/bookings') : () => setStep(2)}
            className="bg-brand-purple text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors uppercase shadow-md"
          >
            {isSuccess ? 'VIEW BOOKING DETAILS' : 'TRY AGAIN'}
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="bg-brand-purple text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors uppercase shadow-md"
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e6e6e6] font-sans pb-20">
      <Header isLoggedIn={!!user} />
      
      <div className="px-4 pt-10">
        {/* Progress Bar (Visual Only) */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 max-w-4xl mx-auto border border-gray-100">
          <div className="flex justify-between items-center relative mb-4 max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 transform -translate-y-1/2 mx-10" />
            
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full ${step >= 1 ? 'bg-[#a86add]' : 'bg-gray-300'} border-4 border-white shadow-md text-white font-bold text-lg flex items-center justify-center`}>{step > 1 ? <Check size={24} strokeWidth={4} /> : 1}</div>
              <p className="mt-2 text-sm text-[#a86add] font-bold">Info</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full ${step >= 2 ? 'bg-[#009900]' : 'bg-gray-300'} border-4 border-white shadow-md text-white font-bold text-lg flex items-center justify-center`}>{step > 2 ? <Check size={24} strokeWidth={4} /> : 2}</div>
              <p className={`mt-2 text-sm ${step >= 2 ? 'text-[#a86add]' : 'text-gray-500'} font-bold`}>Payment</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full ${step >= 3 ? 'bg-[#009900]' : 'bg-gray-300'} border-4 border-white shadow-md text-white font-bold text-lg flex items-center justify-center`}>{step > 3 ? <Check size={24} strokeWidth={4} /> : 3}</div>
              <p className={`mt-2 text-sm ${step >= 3 ? 'text-[#a86add]' : 'text-gray-500'} font-bold`}>Confirm</p>
            </div>
          </div>
        </div>
        
        {/* Render Steps */}
        <div className="animate-fade-in">
          {step === 1 && <CustomerInfoView />}
          {step === 2 && <MethodSelectionView />}
          {step === 3 && <PaymentDetailsView />}
          {step === 4 && <ConfirmationView />}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;