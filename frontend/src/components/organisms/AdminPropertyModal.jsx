import React from 'react';
import Icon from '../../components/atoms/Icon'; // Adjust path if moved to separate file

const AddPropertyModal = ({ onClose, onSave }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      {/* 1. Dark Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* 2. The Form Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-slide-up">
        
        {/* Header - Matches Admin Sidebar Color */}
        <div className="bg-[#afa2ba] p-6 flex justify-between items-center border-b border-white/10">
          <h3 className="text-2xl font-extrabold text-white tracking-wide">
            Add New Property
          </h3>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <Icon name="X" size={28} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          
          {/* Row 1: Property Identity */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Condo Name</label>
            <input 
              type="text" 
              placeholder="e.g. SMDC Grass Residences" 
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 outline-none focus:border-[#afa2ba] transition-colors" 
            />
          </div>

          {/* Row 2: Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Unit Type</label>
              <div className="relative">
                <select className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 outline-none focus:border-[#afa2ba] bg-white appearance-none cursor-pointer">
                  <option>Studio Type</option>
                  <option>1-Bedroom</option>
                  <option>2-Bedroom</option>
                  <option>Penthouse</option>
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                  <Icon name="ChevronDown" size={20} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Condo Type</label>
              <div className="relative">
                <select className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 outline-none focus:border-[#afa2ba] bg-white appearance-none cursor-pointer">
                  <option>Residential Condominium</option>
                  <option>Mixed-Use Condominium</option>
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                  <Icon name="ChevronDown" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Location</label>
            <div className="relative">
              <Icon name="MapPin" className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="City, Area (e.g. BGC, Taguig)" 
                className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 text-gray-700 outline-none focus:border-[#afa2ba] transition-colors" 
              />
            </div>
          </div>

          {/* Row 4: Price & Owner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Price (Monthly)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 font-bold">₱</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-8 text-gray-700 outline-none focus:border-[#afa2ba] transition-colors" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Listed By (Owner)</label>
              <input 
                type="text" 
                placeholder="Search Owner..." 
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 outline-none focus:border-[#afa2ba] transition-colors" 
              />
            </div>
          </div>

          {/* Row 5: Status Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Status:</label>
            <label className="flex items-center cursor-pointer gap-2">
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#afa2ba]" />
              <span className="text-sm font-bold text-green-600">Active</span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="px-10 py-3 bg-[#afa2ba] text-white font-bold rounded-xl shadow-md hover:bg-purple-400 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Save Property
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddPropertyModal;