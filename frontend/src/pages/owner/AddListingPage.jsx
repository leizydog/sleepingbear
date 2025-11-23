import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/organisms/Header';
import ListingProgress from '../../components/molecules/ListingProgress';
import Icon from '../../components/atoms/Icon';
import { propertyAPI } from '../../services/api'; 
import { Loader2, Check, Plus, X, Image as ImageIcon, CreditCard, Smartphone, Banknote } from 'lucide-react';

const AddListingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- STATE MANAGEMENT ---
  const [images, setImages] = useState([]); 
  const [formData, setFormData] = useState({
    // Property Details
    condoName: '',
    unitNumber: '',
    unitType: 'Studio',
    condoType: 'Residential',
    address: '',
    price: '',
    size: '',
    bedrooms: 1,
    bathrooms: 1,
    description: '',
    
    // Payment Methods
    paymentMethods: {
        bpi: false,
        gcash: false,
        cash: false
    },
    bankDetails: {
        accountName: '',
        accountNumber: ''
    },
    gcashDetails: {
        name: '',
        number: ''
    }
  });

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setFormData({
        ...formData,
        paymentMethods: { ...formData.paymentMethods, [method]: !formData.paymentMethods[method] }
    });
  };

  const handleBankChange = (e) => {
    setFormData({ 
        ...formData, 
        bankDetails: { ...formData.bankDetails, [e.target.name]: e.target.value } 
    });
  };

  const handleGcashChange = (e) => {
    setFormData({ 
        ...formData, 
        gcashDetails: { ...formData.gcashDetails, [e.target.name]: e.target.value } 
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    
    if (images.length + newImages.length > 10) {
        alert("You can only upload a maximum of 10 images.");
        return;
    }
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let paymentInfoString = "\n\n--- Payment Options ---";
      if (formData.paymentMethods.cash) paymentInfoString += "\n• Cash Payment Accepted (Visit Admin Office)";
      if (formData.paymentMethods.bpi) paymentInfoString += `\n• Bank Transfer (BPI): ${formData.bankDetails.accountNumber} (${formData.bankDetails.accountName})`;
      if (formData.paymentMethods.gcash) paymentInfoString += `\n• GCash: ${formData.gcashDetails.number} (${formData.gcashDetails.name})`;

      const finalDescription = (formData.description || `${formData.condoType} unit in ${formData.address}`) + paymentInfoString;

      const payload = {
        name: `${formData.condoName} - ${formData.unitNumber}`,
        description: finalDescription,
        address: formData.address,
        price_per_month: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        size_sqm: parseFloat(formData.size),
        status: 'pending',
        images: images, 
        image_url: images[0] || "https://via.placeholder.com/400", 
        is_available: true
      };

      await propertyAPI.create(payload);
      alert("Listing submitted successfully! Please wait for Admin approval.");
      navigate('/owner/dashboard'); 

    } catch (error) {
      console.error("Failed to create listing:", error);
      alert(error.response?.data?.detail || "Failed to create listing. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FUNCTIONS (Use these to prevent blinking/loss of focus) ---

  const renderDetails = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Image Upload Section */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <ImageIcon className="text-[#a86add]" /> Property Photos
            </h3>
            <span className="text-sm font-medium text-gray-500">{images.length} / 10 Uploaded</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-2">
            {images.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                    <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    <button 
                        onClick={() => removeImage(idx)} 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <X size={14} />
                    </button>
                    {idx === 0 && <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center py-1 font-bold">COVER</div>}
                </div>
            ))}
            {images.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-[#a86add] transition-all group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#a86add] flex items-center justify-center transition-colors text-gray-400 group-hover:text-white mb-2">
                        <Plus size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-[#a86add]">Add Photo</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
            )}
        </div>
      </div>

      {/* Details Inputs */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Property Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Condo Name</label>
                <input name="condoName" value={formData.condoName} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#a86add] transition-colors" placeholder="e.g. SMDC Grass" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Unit Number</label>
                <input name="unitNumber" value={formData.unitNumber} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#a86add] transition-colors" placeholder="e.g. 24-B" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Price (₱)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#a86add] transition-colors" placeholder="0.00" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Size (sqm)</label>
                <input type="number" name="size" value={formData.size} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#a86add] transition-colors" placeholder="e.g. 24" />
            </div>
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Bedrooms</label>
                 <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none bg-white focus:border-[#a86add]">
                    <option value="0">Studio</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3+ Bedrooms</option>
                 </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
            <input name="address" value={formData.address} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#a86add] transition-colors" placeholder="Building, Street, City" />
        </div>
        
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#a86add] transition-colors h-32" placeholder="Describe the unit features, view, and amenities..." />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button onClick={() => setStep(2)} className="bg-[#a86add] text-white font-bold text-lg py-3 px-12 rounded-xl shadow-xl hover:bg-[#965ac9] transition-all transform hover:-translate-y-1">
            NEXT: Payment Details
        </button>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Payment Configuration</h2>
        <p className="text-gray-500">Select how you want to receive payments from tenants.</p>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
        
        {/* Selection Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
            {[
                { id: 'bpi', label: 'BPI Bank Transfer', icon: CreditCard },
                { id: 'gcash', label: 'GCash e-Wallet', icon: Smartphone },
                { id: 'cash', label: 'Cash Payment', icon: Banknote }
            ].map((item) => (
            <label key={item.id} className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethods[item.id] ? 'border-[#a86add] bg-purple-50 text-[#a86add]' : 'border-gray-200 hover:border-purple-200 text-gray-600'}`}>
                <input type="checkbox" className="hidden" checked={formData.paymentMethods[item.id]} onChange={() => handlePaymentMethodChange(item.id)} />
                <item.icon size={20} />
                <span className="font-bold uppercase">{item.label}</span>
                {formData.paymentMethods[item.id] && <Check size={20} />}
            </label>
            ))}
        </div>

        <hr className="border-gray-100 my-6" />

        {/* BPI Inputs (Standard Form) */}
        {formData.paymentMethods.bpi && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 flex items-center gap-2"><CreditCard size={16}/> BPI Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Account Name</label>
                        <input name="accountName" value={formData.bankDetails.accountName} onChange={handleBankChange} type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#a86add]" placeholder="Account Holder Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Account Number</label>
                        <input name="accountNumber" value={formData.bankDetails.accountNumber} onChange={handleBankChange} type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#a86add]" placeholder="0000 0000 0000" />
                    </div>
                </div>
            </div>
        )}

        {/* GCash Inputs */}
        {formData.paymentMethods.gcash && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 animate-fade-in">
                <h3 className="text-sm font-bold uppercase text-blue-500 mb-4 flex items-center gap-2"><Smartphone size={16}/> GCash Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-blue-800 mb-1">GCash Name</label>
                        <input name="name" value={formData.gcashDetails.name} onChange={handleGcashChange} type="text" className="w-full border border-blue-200 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="GCash Register Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-blue-800 mb-1">GCash Number</label>
                        <input name="number" value={formData.gcashDetails.number} onChange={handleGcashChange} type="text" className="w-full border border-blue-200 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="09XX XXX XXXX" />
                    </div>
                </div>
            </div>
        )}

        {/* Cash Message */}
        {formData.paymentMethods.cash && (
             <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm font-medium text-center animate-fade-in">
                Tenants will be instructed to visit the administration office to settle payments in cash.
             </div>
        )}
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button onClick={() => setStep(1)} className="text-gray-500 font-bold px-8 py-3 hover:bg-gray-100 rounded-xl transition-colors">BACK</button>
        <button onClick={() => setStep(3)} className="bg-[#a86add] text-white font-bold text-xl py-3 px-16 rounded-xl shadow-lg hover:bg-[#965ac9] transition-all">Review & Submit</button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-[#a86add]">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Ready to Publish?</h2>
        <p className="text-gray-500 mb-8">Your listing will be saved as <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">PENDING</span> until an Admin approves it.</p>
        
        <div className="text-left bg-gray-50 p-6 rounded-xl mb-8 space-y-4 text-sm border border-gray-200">
            <div className="flex justify-between">
                <span className="text-gray-500">Property:</span>
                <span className="font-bold text-gray-900">{formData.condoName} {formData.unitNumber}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-bold text-gray-900">{formData.address}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500">Price:</span>
                <span className="font-bold text-green-600">₱{parseFloat(formData.price || 0).toLocaleString()}/mo</span>
            </div>
            <hr className="border-gray-200"/>
            <div>
                <span className="text-gray-500 block mb-2">Payment Methods:</span>
                <ul className="space-y-1 pl-4">
                    {formData.paymentMethods.bpi && <li className="flex items-center gap-2"><CreditCard size={14}/> BPI: <strong>{formData.bankDetails.accountNumber}</strong></li>}
                    {formData.paymentMethods.gcash && <li className="flex items-center gap-2"><Smartphone size={14}/> GCash: <strong>{formData.gcashDetails.number}</strong></li>}
                    {formData.paymentMethods.cash && <li className="flex items-center gap-2"><Banknote size={14}/> Cash Accepted</li>}
                </ul>
            </div>
        </div>

        <div className="flex justify-center gap-4">
            <button onClick={() => setStep(2)} className="text-gray-500 font-bold px-6 py-3 hover:bg-gray-100 rounded-xl transition-colors">BACK</button>
            <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="bg-[#a86add] text-white font-bold text-xl py-3 px-12 rounded-xl shadow-lg hover:bg-[#965ac9] flex items-center gap-2 transition-all hover:-translate-y-1"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'SUBMIT LISTING'}
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans pb-20">
      <Header isLoggedIn={true} />
      <div className="px-4 pt-10">
        <ListingProgress step={step} />
        <div className="mt-8">
          {step === 1 && renderDetails()}
          {step === 2 && renderPaymentMethods()}
          {step === 3 && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default AddListingPage;