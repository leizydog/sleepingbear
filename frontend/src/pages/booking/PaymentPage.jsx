import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Check, AlertTriangle, Loader2, UploadCloud, QrCode, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/organisms/Header';
import Input from '../../components/atoms/Input'; 
import api, { paymentsAPI } from '../../services/api'; 

// --- EXTRACTED COMPONENTS ---

const CustomerContactForm = memo(({ 
  address, handleAddressChange, 
  // phoneNumber removed from UI as requested
  idImage, handleIdUpload, handleProceedToPayment 
}) => (
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

    {/* ✅ REMOVED REDUNDANT PHONE INPUT */}

    <div className="mb-8">
      <label htmlFor="idUpload" className="block text-sm font-bold text-gray-700 mb-2">Upload Government ID (Required)</label>
      <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
        <input
          type="file" id="idUpload" accept="image/*,.pdf" onChange={handleIdUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a86add]/10 file:text-[#a86add] hover:file:bg-[#a86add]/20 cursor-pointer"
          required
        />
        {idImage && (
            <div className="flex items-center text-green-600 gap-2 bg-green-50 px-3 py-1 rounded-full">
                <Check size={14} />
                <span className="text-xs font-bold">{idImage.name}</span>
            </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2 ml-1">Accepted formats: JPG, PNG, PDF. Max size: 5MB.</p>
    </div>

    <div className="text-center pt-4">
      <button
        onClick={handleProceedToPayment}
        className="bg-[#4b0082] text-white font-bold py-4 px-16 rounded-2xl shadow-xl hover:bg-[#a86add] transition-all transform hover:-translate-y-1 text-lg uppercase tracking-widest w-full md:w-auto"
      >
        PROCEED TO PAYMENT
      </button>
    </div>
  </>
));

// ✅ UPDATED: Filter Payment Methods based on Property
const MethodSelectionView = ({ paymentMethod, setPaymentMethod, setStep, property }) => {
  
  const availableMethods = [];
  if (property?.accepts_bpi) availableMethods.push('BPI');
  if (property?.accepts_gcash) availableMethods.push('GCASH');
  if (property?.accepts_cash) availableMethods.push('CASH');

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-black mb-6 text-center">Select Payment Method:</h2>
        
        {availableMethods.length > 0 ? (
          <div className="space-y-4 mb-8">
            {availableMethods.map(method => (
              <div 
                key={method} onClick={() => setPaymentMethod(method)}
                className={`cursor-pointer border-[3px] rounded-xl p-4 flex items-center bg-white transition-all ${paymentMethod === method ? 'border-[#a86add] bg-purple-50' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <div className={`w-6 h-6 rounded-full border-[3px] border-gray-400 mr-4 flex items-center justify-center ${paymentMethod === method ? 'border-[#a86add] bg-[#a86add]' : 'bg-white'}`}>
                  {paymentMethod === method && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-xl font-bold uppercase text-black">{method}</span>
              </div>
            ))}
          </div>
        ) : (
           <div className="p-6 bg-red-50 text-red-700 text-center rounded-xl border border-red-200 mb-6">
              <p className="font-bold">No payment methods enabled.</p>
              <p className="text-sm mt-1">Please contact the property owner.</p>
           </div>
        )}

        <button 
          disabled={!paymentMethod}
          onClick={() => setStep(3)} 
          className={`w-full py-4 rounded-xl text-white font-bold text-xl tracking-wider shadow-md transition-all ${!paymentMethod ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#4b0082] hover:bg-purple-600'}`}
        >
          NEXT
        </button>
    </div>
  );
};

// ✅ UPDATED: Shows QR Code & Receipt Upload for GCash
const PaymentDetailsView = ({ 
  paymentMethod, 
  bookingDetails,
  handleFinalPaymentSubmission, 
  loading, 
  agreedTerms, 
  setAgreedTerms,
  receiptImage,
  handleReceiptUpload
}) => {
  const property = bookingDetails?.property || {};
  
  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
      <h2 className="text-2xl font-extrabold text-black mb-8 text-center uppercase tracking-tight">
        {paymentMethod} PAYMENT
      </h2>

      <div className="space-y-6 mb-10 px-4">
        {/* --- BPI --- */}
        {paymentMethod === 'BPI' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm text-blue-800 font-bold">Test Mode: Use 4242 4242 4242 4242</p>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Card Number</label>
                <Input type="text" className="w-full border-2 border-gray-300 rounded-lg p-3" placeholder="0000 0000 0000 0000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Expiry</label><input type="text" className="w-full border-2 border-gray-300 rounded-lg p-3" placeholder="MM/YY" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">CVC</label><input type="text" className="w-full border-2 border-gray-300 rounded-lg p-3" placeholder="123" /></div>
            </div>
          </div>
        )}

        {/* --- GCASH --- */}
        {paymentMethod === 'GCASH' && (
          <div className="space-y-6">
              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  {property.gcash_qr_image_url ? (
                      <img 
                        src={property.gcash_qr_image_url} 
                        alt="GCash QR" 
                        className="w-48 h-48 object-contain mb-4 rounded-lg shadow-sm bg-white border" 
                      />
                  ) : (
                      <div className="w-48 h-48 bg-white flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 mb-4">
                          <QrCode size={48} className="text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400">No QR Code</p>
                      </div>
                  )}
                  
                  <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Send Payment to:</p>
                      <div 
                        className="flex items-center gap-2 justify-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-blue-50 transition-colors" 
                        onClick={() => navigator.clipboard.writeText(property.gcash_number)}
                      >
                          <span className="font-mono text-lg font-bold text-blue-600 tracking-wider">
                              {property.gcash_number || "Not Provided"}
                          </span>
                          <Copy size={16} className="text-gray-400 hover:text-blue-600" />
                      </div>
                  </div>
              </div>

              {/* Upload Section */}
              <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Upload Payment Screenshot</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors group cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleReceiptUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center">
                          <UploadCloud size={40} className={`mb-2 ${receiptImage ? 'text-green-500' : 'text-gray-400 group-hover:text-[#a86add]'}`} />
                          <p className={`text-sm font-bold ${receiptImage ? 'text-green-600' : 'text-gray-600'}`}>
                              {receiptImage ? receiptImage.name : "Click to upload receipt"}
                          </p>
                          {!receiptImage && <p className="text-xs text-gray-400 mt-1">JPG, PNG supported</p>}
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* --- CASH --- */}
        {paymentMethod === 'CASH' && (
             <div className="bg-green-50 p-6 rounded-xl text-green-800 font-bold text-center border border-green-200">
                <p className="mb-2 text-lg">Pay at the Office</p>
                <p className="text-sm font-normal">Please proceed to submit your booking. Your slot will be reserved, and you can settle the payment at the Admin office upon arrival.</p>
            </div>
        )}
      </div>

      <div className="flex justify-center items-center mb-6 gap-3 cursor-pointer" onClick={() => setAgreedTerms(!agreedTerms)}>
        <div className={`w-6 h-6 border-[3px] border-black flex items-center justify-center ${agreedTerms ? 'bg-black text-white' : 'bg-white'}`}>
          {agreedTerms && <Check size={16} strokeWidth={4} />}
        </div>
        <span className="font-bold text-sm text-black">I agree to the Terms and Conditions</span>
      </div>

      <button 
        onClick={handleFinalPaymentSubmission}
        disabled={loading || !agreedTerms || (paymentMethod === 'GCASH' && !receiptImage)}
        className={`w-full text-white font-bold text-xl py-4 rounded-xl shadow-md transition-all uppercase tracking-widest flex justify-center items-center gap-2 ${loading || !agreedTerms || (paymentMethod === 'GCASH' && !receiptImage) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4b0082] hover:bg-purple-600'}`}
      >
        {loading ? <><Loader2 className="animate-spin" /> Processing...</> : 'SUBMIT PAYMENT'}
      </button>
    </div>
  );
};

const ConfirmationView = ({ isSuccess, isPending, setStep, navigate }) => (
  <div className="max-w-3xl mx-auto mt-16 text-center px-4 animate-fade-in">
    <div className={`bg-white p-10 rounded-3xl shadow-xl border-t-8 ${isSuccess || isPending ? 'border-[#009900]' : 'border-red-600'}`}>
        {(isSuccess || isPending) ? (
            <>
                <Check size={80} className="text-[#009900] mx-auto mb-4" />
                <h2 className="text-4xl font-extrabold text-black mb-6">{isPending ? 'Submitted for Review' : 'Booking Confirmed!'}</h2>
                <p className="text-xl text-black mb-12 font-medium">
                    {isPending ? 'Your receipt has been uploaded. Please wait for admin/owner approval.' : 'You will receive a booking confirmation email.'}
                </p>
            </>
        ) : (
            <>
                <AlertTriangle size={80} className="text-red-600 mx-auto mb-4" />
                <h2 className="text-4xl font-extrabold text-black mb-4">Payment Failed</h2>
                <p className="text-xl text-black mb-4 font-medium">Please try again.</p>
            </>
        )}
      
      <div className="flex justify-center gap-6">
        {(isSuccess || isPending) ? (
            <button onClick={() => navigate('/bookings')} className="bg-[#4b0082] text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors uppercase shadow-md">
              VIEW BOOKINGS
            </button>
        ) : (
            <button onClick={() => setStep(2)} className="bg-[#4b0082] text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors uppercase shadow-md">
              TRY AGAIN
            </button>
        )}
        <button onClick={() => navigate('/')} className="bg-white border-2 border-[#4b0082] text-[#4b0082] font-bold text-lg px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors uppercase shadow-md">
          HOME
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); 
  const bookingId = location.state?.bookingId; 

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(''); 
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false); 
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // ✅ Default to user info
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || ''); 
  const [idImage, setIdImage] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);

  useEffect(() => {
    if (!bookingId) {
        alert("No booking selected.");
        navigate('/bookings');
        return;
    }
    const fetchDetails = async () => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBookingDetails(response.data || response);
        } catch (error) {
            console.error("Failed to load booking:", error);
        }
    };
    fetchDetails();
  }, [bookingId, navigate]);

  useEffect(() => {
    if (user?.phone) setPhoneNumber(user.phone);
  }, [user]);

  const handleIdUpload = useCallback((e) => setIdImage(e.target.files[0]), []);
  const handleReceiptUpload = useCallback((e) => setReceiptImage(e.target.files[0]), []);
  const handleAddressChange = useCallback((e) => setAddress(e.target.value), []);
  
  const handleProceedToPayment = useCallback(() => {
    // Only check address and ID, phone is from profile
    if (!address || !idImage) { 
        alert('Please provide your address and upload an ID.'); 
        return; 
    }
    setStep(2);
  }, [address, idImage]);

  const handleFinalPaymentSubmission = async () => {
    if (!paymentMethod) return;
    setLoading(true);

    try {
        if (paymentMethod === 'GCASH') {
            if (!receiptImage) throw new Error("Receipt image is required");

            const formData = new FormData();
            formData.append('booking_id', bookingId);
            formData.append('payment_method', 'gcash');
            formData.append('file', receiptImage);

            await paymentsAPI.uploadReceipt(formData);
            setIsPending(true); 
            setIsSuccess(true);
        } else {
            const payload = { booking_id: bookingId, payment_method: paymentMethod.toLowerCase() };
            const intentRes = await paymentsAPI.createIntent(payload);
            await paymentsAPI.confirm({ payment_intent_id: intentRes.payment_intent_id });
            setIsSuccess(true);
            setIsPending(false);
        }
        setStep(4);

    } catch (error) {
        console.error("Payment failed:", error);
        alert("Payment failed. Please try again.");
        setIsSuccess(false);
    } finally {
        setLoading(false);
    }
  };

  const loggedInUser = user || { full_name: 'Guest', email: 'N/A', phone: '' };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans pb-20">
      <Header isLoggedIn={!!user} />
      <div className="px-4 pt-10">
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 max-w-4xl mx-auto border border-gray-100">
          <div className="flex justify-between items-center relative mb-4 max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 transform -translate-y-1/2 mx-10" />
            {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full ${step >= i ? (step > i ? 'bg-[#009900]' : 'bg-[#a86add]') : 'bg-gray-300'} border-4 border-white shadow-md text-white font-bold text-lg flex items-center justify-center`}>
                        {step > i ? <Check size={24} strokeWidth={4} /> : i}
                    </div>
                    <p className={`mt-2 text-sm font-bold ${step >= i ? 'text-[#a86add]' : 'text-gray-500'}`}>{['Info', 'Payment', 'Confirm'][i-1]}</p>
                </div>
            ))}
          </div>
        </div>
        
        <div className="animate-fade-in">
          {step === 1 && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
              
              {bookingDetails && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-800 text-center font-bold">
                      Paying: ₱{bookingDetails.total_amount?.toLocaleString()}
                  </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg mb-8">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" /> Logged-in Profile Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-blue-700">
                  <p><span className="font-bold">Name:</span> {loggedInUser.full_name}</p>
                  <p><span className="font-bold">Phone:</span> {loggedInUser.phone || phoneNumber || 'N/A'}</p>
                  <p className="col-span-2"><span className="font-bold">Email:</span> {loggedInUser.email}</p>
                </div>
              </div>

              <CustomerContactForm 
                address={address} 
                handleAddressChange={handleAddressChange} 
                phoneNumber={phoneNumber} 
                handlePhoneChange={() => {}} // Empty handler
                idImage={idImage} 
                handleIdUpload={handleIdUpload} 
                handleProceedToPayment={handleProceedToPayment} 
                isPhoneReadOnly={true} 
              />
            </div>
          )}
          {step === 2 && <MethodSelectionView paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} setStep={setStep} property={bookingDetails?.property} />}
          {step === 3 && <PaymentDetailsView paymentMethod={paymentMethod} bookingDetails={bookingDetails} handleFinalPaymentSubmission={handleFinalPaymentSubmission} loading={loading} agreedTerms={agreedTerms} setAgreedTerms={setAgreedTerms} receiptImage={receiptImage} handleReceiptUpload={handleReceiptUpload} />}
          {step === 4 && <ConfirmationView isSuccess={isSuccess} isPending={isPending} setStep={setStep} navigate={navigate} />}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;