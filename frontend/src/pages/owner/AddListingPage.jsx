import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/organisms/Header';
import ListingProgress from '../../components/molecules/ListingProgress';
import Icon from '../../components/atoms/Icon';

const AddListingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // --- Step 1: Property Details ---
  const DetailsForm = () => (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-4xl font-extrabold text-center mb-10 text-gray-900 tracking-tight">Property Details</h2>
      
      <div className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="w-48 text-lg font-bold text-gray-700">Condo Name:</label>
          <input type="text" className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-lg outline-none focus:border-[#a86add] transition-colors" placeholder="e.g. SMDC Grass" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="w-48 text-lg font-bold text-gray-700">Unit Number:</label>
          <input type="text" className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-lg outline-none focus:border-[#a86add] transition-colors" placeholder="e.g. 24-B" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="w-48 text-lg font-bold text-gray-700">Unit Type:</label>
          <div className="flex-1 relative">
            <select className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg outline-none bg-white appearance-none cursor-pointer focus:border-[#a86add]">
                <option>Select Unit Type</option>
                <option>Studio</option>
                <option>1 Bedroom</option>
                <option>2 Bedroom</option>
            </select>
            <div className="absolute right-4 top-4 text-gray-400 pointer-events-none"><Icon name="ChevronDown" size={20} /></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="w-48 text-lg font-bold text-gray-700">Condo Type:</label>
          <div className="flex-1 relative">
            <select className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg outline-none bg-white appearance-none cursor-pointer focus:border-[#a86add]">
                <option>Select Condo Type</option>
                <option>Residential</option>
                <option>Mixed-Use</option>
            </select>
            <div className="absolute right-4 top-4 text-gray-400 pointer-events-none"><Icon name="ChevronDown" size={20} /></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="w-48 text-lg font-bold text-gray-700">Address / Location:</label>
          <input type="text" className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-lg outline-none focus:border-[#a86add] transition-colors" placeholder="City, Area" />
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button 
            onClick={() => setStep(2)}
            className="bg-[#a86add] text-white font-bold text-xl py-3 px-16 rounded-xl shadow-lg hover:bg-[#965ac9] transition-all transform hover:-translate-y-1"
        >
          NEXT
        </button>
      </div>
    </div>
  );

  // --- Step 2: Payment Methods ---
  const PaymentMethodForm = () => (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        How can tenants pay the rent? <span className="text-gray-500 text-base font-normal">(Check all that apply)</span>
      </h2>
      
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-8">
        {/* Checkboxes */}
        <div className="flex justify-center gap-8 flex-wrap">
            {['BPI', 'Cash', 'GCash'].map((method) => (
            <label key={method} className="flex items-center gap-3 text-xl font-bold text-gray-800 cursor-pointer hover:text-[#a86add] transition-colors">
                <input type="checkbox" className="w-6 h-6 border-2 border-gray-400 rounded bg-white accent-[#a86add]" />
                {method}
            </label>
            ))}
        </div>

        <hr className="border-gray-100" />

        {/* Bank Details Section */}
        <div>
            <h3 className="text-lg font-bold mb-4 text-gray-700">Bank Details (if applicable):</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <label className="w-40 text-base font-bold text-gray-600">Bank Name:</label>
                    <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2 outline-none focus:border-[#a86add]" />
                </div>
                <div className="flex items-center gap-4">
                    <label className="w-40 text-base font-bold text-gray-600">Account Name:</label>
                    <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2 outline-none focus:border-[#a86add]" />
                </div>
                <div className="flex items-center gap-4">
                    <label className="w-40 text-base font-bold text-gray-600">Account Number:</label>
                    <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2 outline-none focus:border-[#a86add]" />
                </div>
                <div className="flex items-center gap-4">
                    <label className="w-40 text-base font-bold text-gray-600">GCash Number:</label>
                    <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2 outline-none focus:border-[#a86add]" />
                </div>
            </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button onClick={() => setStep(1)} className="text-gray-500 font-bold px-8 py-3 hover:bg-gray-100 rounded-xl transition-colors">BACK</button>
        <button onClick={() => setStep(3)} className="bg-[#a86add] text-white font-bold text-xl py-3 px-16 rounded-xl shadow-lg hover:bg-[#965ac9] transition-all">
          NEXT
        </button>
      </div>
    </div>
  );

  // --- Step 3: Confirmation ---
  const ConfirmationView = () => (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-[#a86add]">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to Publish?</h2>
        <p className="text-gray-600 mb-8 text-lg">
            Please review your listing details. By clicking submit, you confirm that all information is accurate.
        </p>
        
        <div className="flex flex-col items-start gap-4 bg-gray-50 p-6 rounded-xl mb-8">
            <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-[#a86add]" />
                <span className="text-sm text-gray-700 font-medium">I confirm that all information provided is accurate and complete.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-[#a86add]" />
                <span className="text-sm text-gray-700 font-medium">I agree to the terms and conditions of the platform.</span>
            </label>
        </div>

        <div className="flex justify-center gap-4">
            <button onClick={() => setStep(2)} className="text-gray-500 font-bold px-6 py-3 hover:bg-gray-100 rounded-xl transition-colors">BACK</button>
            <button 
                onClick={() => { alert("Listing Submitted for Review!"); navigate('/owner/dashboard'); }}
                className="bg-[#a86add] text-white font-bold text-xl py-3 px-12 rounded-xl shadow-lg hover:bg-[#965ac9] transition-all hover:-translate-y-1"
            >
                SUBMIT LISTING
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans pb-20">
      <Header isLoggedIn={true} />
      
      <div className="px-4 pt-10">
        {/* Progress Bar */}
        <ListingProgress step={step} />
        
        {/* Steps Render */}
        <div className="mt-8">
          {step === 1 && <DetailsForm />}
          {step === 2 && <PaymentMethodForm />}
          {step === 3 && <ConfirmationView />}
        </div>
      </div>
    </div>
  );
};

export default AddListingPage;