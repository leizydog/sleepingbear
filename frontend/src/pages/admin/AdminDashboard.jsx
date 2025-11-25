import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/organisms/Sidebar'; 
import DataTable from '../../components/organisms/DataTable'; 
import Icon from '../../components/atoms/Icon';
import { useAuth } from '../../context/AuthContext';
import { 
  propertyAPI, 
  bookingAPI, 
  paymentsAPI, 
  reportsAPI,
  authAPI 
} from '../../services/api';

// --- UPDATED TOP BAR WITH DARK MODE ---
const LocalTopBar = ({ sidebarOpen, toggleNotifs, showNotifs, unreadCount, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNavigation = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  return (
    // ADDED: dark:bg-gray-900/80, dark:border-b dark:border-gray-800
    <div className={`fixed top-0 right-0 z-40 flex items-center justify-between px-8 py-4 bg-[#f4f2f6]/80 dark:bg-gray-900/80 backdrop-blur-md transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-20'}`}>
      <div>
        {/* ADDED: dark:text-white */}
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Welcome back, {user?.full_name || 'Admin'}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search Bar - ADDED: dark:bg-gray-800 dark:border-gray-700 */}
        <div className="bg-white dark:bg-gray-800 flex items-center px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-64 hidden md:flex transition-colors">
          <Icon name="Search" size={18} className="text-gray-400" />
          {/* ADDED: dark:text-gray-200 dark:placeholder-gray-500 */}
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-600 dark:text-gray-200 dark:placeholder-gray-500" />
        </div>

        {/* Notifications - ADDED: dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 */}
        <div className="relative">
          <button onClick={toggleNotifs} className={`p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-gray-700 relative ${showNotifs ? 'bg-[#afa2ba] text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}`}>
            <Icon name="Bell" size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">{unreadCount}</span>}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              {/* ADDED: dark:text-gray-200 */}
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase mt-1">{user?.role || 'Super Admin'}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-[#afa2ba] to-purple-300 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white overflow-hidden">
              <Icon name="User" size={20} />
            </div>
            <Icon name="ChevronDown" size={16} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              {/* ADDED: dark:bg-gray-900 dark:border-gray-700 */}
              <div className="absolute right-0 top-14 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 animate-slide-up overflow-hidden">
                <div className="p-2 border-b border-gray-50 dark:border-gray-800 space-y-1">
                  <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">Account Management</p>
                  
                  {/* ADDED: dark:text-gray-300 dark:hover:bg-gray-800 */}
                  <button onClick={() => handleNavigation('/settings')} className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2">
                    <Icon name="User" size={16} /> Manage Account
                  </button>

                  <button onClick={() => handleNavigation('/settings')} className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2">
                    <Icon name="Settings" size={16} /> Settings
                  </button>
                </div>

                <div className="p-2">
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2">
                    <Icon name="LogOut" size={16} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODAL WITH DARK MODE ---
const AddPropertyModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', address: '', description: '', price_per_month: '', bedrooms: 1, bathrooms: 1, size_sqm: 0, images: [] 
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (formData.images.length + files.length > 10) {
        alert("You can only upload up to 10 images total.");
        return;
    }

    setUploading(true);
    try {
        const uploadData = new FormData();
        files.forEach(file => uploadData.append('files', file));
        
        const result = await propertyAPI.uploadImages(uploadData);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...result.images]
        }));
    } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload images.");
    } finally {
        setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async () => {
    if (formData.images.length < 3) { alert("Please upload at least 3 images."); return; }
    try {
      await propertyAPI.create({
        ...formData,
        price_per_month: parseFloat(formData.price_per_month),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        size_sqm: parseFloat(formData.size_sqm)
      });
      alert("Property Created Successfully!");
      onSave();
    } catch (error) {
      console.error(error);
      alert("Failed to create property. Check console for details.");
    }
  };

  // Common Input Style - ADDED: dark:bg-gray-800 dark:border-gray-700 dark:text-white
  const inputStyle = "w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba] dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors";
  const labelStyle = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      {/* ADDED: dark:bg-gray-900 dark:border-gray-700 */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-slide-up border border-white/20 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className="bg-[#afa2ba] dark:bg-gray-800 px-8 py-6 flex justify-between items-center flex-shrink-0 border-b dark:border-gray-700">
          <div><h3 className="text-2xl font-extrabold text-white tracking-wide">Add New Property</h3></div>
          <button onClick={onClose} className="text-white bg-white/10 hover:bg-white/30 rounded-full p-2 transition-all"><Icon name="X" size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
           <div className="space-y-4">
             {/* ADDED: dark:border-gray-700 dark:text-white */}
             <h4 className="font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">Basic Information</h4>
             <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2"><label className={labelStyle}>Property Name</label><input name="name" onChange={handleChange} type="text" placeholder="e.g. SMDC Grass Residences Tower 4" className={inputStyle} /></div>
                <div className="col-span-2"><label className={labelStyle}>Address</label><input name="address" onChange={handleChange} type="text" placeholder="Full Address" className={inputStyle} /></div>
                <div className="col-span-2"><label className={labelStyle}>Description</label><textarea name="description" onChange={handleChange} placeholder="Describe the property features, amenities, etc." rows={3} className={inputStyle} /></div>
                <div><label className={labelStyle}>Bedrooms</label><input name="bedrooms" onChange={handleChange} type="number" className={inputStyle} /></div>
                <div><label className={labelStyle}>Bathrooms</label><input name="bathrooms" onChange={handleChange} type="number" className={inputStyle} /></div>
                <div><label className={labelStyle}>Price (₱ / Month)</label><input name="price_per_month" onChange={handleChange} type="number" placeholder="0.00" className={inputStyle} /></div>
                <div><label className={labelStyle}>Size (sqm)</label><input name="size_sqm" onChange={handleChange} type="number" placeholder="0" className={inputStyle} /></div>
             </div>
           </div>
           <div className="space-y-4">
             <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
               <h4 className="font-bold text-gray-800 dark:text-white">Property Images <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Min 3, Max 10)</span></h4>
               <span className={`text-xs font-bold ${formData.images.length < 3 ? 'text-red-500' : 'text-green-500'}`}>{formData.images.length} / 10 Added</span>
             </div>
             {/* ADDED: dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 */}
             <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer relative">
               <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="flex flex-col items-center">
                 <Icon name="Image" size={32} className="text-gray-400 mb-2" />
                 <p className="text-sm font-bold text-gray-600 dark:text-gray-300">{uploading ? "Uploading..." : "Click or Drag to Upload Images"}</p>
                 <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB each)</p>
               </div>
             </div>
             {formData.images.length > 0 && (
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                 {formData.images.map((img, idx) => (
                   <div key={idx} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-800">
                     <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                     <button onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><Icon name="X" size={12} /></button>
                     <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1 truncate px-1">{idx === 0 ? 'Main Cover' : `Image ${idx+1}`}</div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
        {/* ADDED: dark:bg-gray-800 dark:border-gray-700 */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 flex-shrink-0">
          <button onClick={onClose} className="px-8 py-3 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm">Cancel</button>
          <button disabled={uploading} onClick={handleSubmit} className={`px-10 py-3 text-white font-bold rounded-xl shadow-lg text-sm ${uploading ? 'bg-gray-400' : 'bg-[#afa2ba] hover:bg-[#9a8a9b] dark:bg-purple-600 dark:hover:bg-purple-700'}`}>
            {uploading ? 'Uploading...' : 'Save Property'}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationDropdown = ({ notifications, isOpen, onClose }) => {
  if (!isOpen) return null;
  // ADDED: dark:bg-gray-900 dark:border-gray-700
  return (
    <div className="absolute top-20 right-8 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 animate-slide-up overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
        <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
        <button className="text-xs text-[#afa2ba] font-bold hover:underline">Mark all read</button>
      </div>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div> : notifications.map((notif, index) => (
          // ADDED: dark:border-gray-800 dark:hover:bg-gray-800
          <div key={index} className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex gap-4 relative group">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'payment' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
              <Icon name={notif.type === 'payment' ? 'CreditCard' : 'Calendar'} size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">{notif.category}</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug">{notif.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center"><button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">Close</button></div>
    </div>
  );
};

const ImagePreviewModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative bg-white dark:bg-gray-900 p-2 rounded-xl max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-200 transition-all z-10"><Icon name="X" size={24} /></button>
        <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[400px]">
           <div className="text-center w-full">
             <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 text-6xl text-gray-400"><Icon name="Image" size={64} /></div>
             <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Preview</p>
             <img src={src} alt="Preview" className="max-w-full max-h-[60vh] mx-auto object-contain rounded" onError={(e) => e.target.style.display='none'} />
             <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 block mt-2 mx-auto w-fit">{src}</code>
           </div>
        </div>
      </div>
    </div>
  );
};

const AddUserModal = ({ type, userToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: userToEdit?.name || '', email: userToEdit?.email || '', role: userToEdit?.role || 'tenant' });
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up border dark:border-gray-700">
        <div className="bg-[#afa2ba] dark:bg-gray-800 px-8 py-6 flex justify-between items-center border-b dark:border-gray-700">
          <div><h3 className="text-xl font-extrabold text-white tracking-wide">{userToEdit ? 'Edit' : 'Add'} User</h3></div>
          <button onClick={onClose} className="text-white bg-white/10 hover:bg-white/30 rounded-full p-2"><Icon name="X" size={20} /></button>
        </div>
        <div className="p-8 space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Name</label><input value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} className="w-full border dark:border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba] dark:bg-gray-800 dark:text-white" /></div>
          <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Email</label><input value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} className="w-full border dark:border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba] dark:bg-gray-800 dark:text-white" /></div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm">Cancel</button>
          <button onClick={()=>onSave(formData)} className="px-6 py-2 bg-[#afa2ba] dark:bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-[#9a8a9b] dark:hover:bg-purple-700 text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const { user } = useAuth();
  
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState({ open: false, type: null, user: null });
  const [previewImage, setPreviewImage] = useState(null);

  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [condoData, setCondoData] = useState([]);
  const [ownersData, setOwnersData] = useState([]);
  const [tenantsData, setTenantsData] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
      try {
          setLoading(true);
          const [statsRes, bookingsRes, propsRes, ownersRes, tenantsRes, adminsRes, paymentsRes] = await Promise.all([
              reportsAPI.getDashboardStats(),
              bookingAPI.getAll(),
              propertyAPI.getAll({ per_page: 100 }),
              authAPI.getAllUsers('owner'),
              authAPI.getAllUsers('tenant'),
              authAPI.getAllUsers('admin'),
              paymentsAPI.getAll()
          ]);

          setStats(statsRes);
          setBookings(bookingsRes);
          setCondoData(propsRes.properties || propsRes || []);
          
          const mapUser = u => ({
             id: u.id, name: u.full_name || u.username, email: u.email, contact: u.phone || 'N/A',
             role: u.role, status: u.is_active ? 'Active' : 'Inactive'
          });

          setOwnersData((ownersRes || []).map(mapUser));
          setTenantsData((tenantsRes || []).map(mapUser));
          setAdminData((adminsRes || []).map(mapUser));

          setPaymentsData((paymentsRes || []).map(p => ({
             id: `PAY-${p.id}`, user: `User #${p.booking_id}`, condo: `Booking #${p.booking_id}`,
             amount: `₱${p.amount.toLocaleString()}`, method: p.payment_method, proof: p.receipt_url, 
             date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
             status: p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1)) : 'Unknown'
          })));
      } catch (error) {
          console.error("Failed to load admin data:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { refreshData(); }, []);

  const handlePropertyAction = async (id, action) => {
    if(!window.confirm(`Are you sure you want to ${action} this property?`)) return;
    try {
        const newStatus = action === 'approve' ? 'approved' : 'rejected'; 
        await propertyAPI.updateStatus(id, newStatus);
        alert(`Property has been ${newStatus.toUpperCase()}.`);
        refreshData();
    } catch (error) { console.error(error); alert("Failed to update property status."); }
  };

  const handlePaymentAction = async (id, action) => { alert("Payment action logic not yet implemented on backend."); };
  const handleSaveUser = async (userData) => { setShowUserModal({ open: false, type: null, user: null }); };
  const handleDeleteUser = (id, type) => { if(!window.confirm("Remove user?")) return; alert("Delete user logic not yet implemented."); };

  const StatusPill = ({ status }) => {
    let s = status ? String(status).toLowerCase() : 'unknown';
    let color = (s === 'confirmed' || s === 'active' || s === 'approved' || s === 'completed' || s === 'paid') ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : (s === 'pending' || s === 'occupied') ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400' : 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
    let label = status;
    if (status === true) { label = 'Available'; color = 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400'; }
    if (status === false) { label = 'Booked'; color = 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'; }
    return <span className={`px-2 py-1 rounded-full font-bold ${color} text-xs border border-current/10 uppercase`}>{String(label)}</span>;
  };

  const UserActionButtons = ({ row, type }) => (
    <div className="flex justify-center gap-3 text-xs font-bold">
      <button onClick={() => setShowUserModal({ open: true, type, user: row })} className="text-blue-500 hover:text-blue-700 dark:text-blue-400">Edit</button>
      <button onClick={() => handleDeleteUser(row.id, type)} className="text-red-500 hover:text-red-700 dark:text-red-400">Delete</button>
    </div>
  );

  const notifications = useMemo(() => {
    const notifs = [];
    if (bookings && Array.isArray(bookings)) {
        bookings.slice(0, 5).forEach(b => {
            if (b.status === 'pending') notifs.push({ type: 'payment', category: 'New Request', message: `Booking #${b.id} pending approval`, time: new Date(b.created_at).toLocaleDateString() });
        });
    }
    return notifs;
  }, [bookings]);

  const AdminsTableView = () => (
    <div className="animate-fade-in max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
         <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Admins</h3>
         <DataTable data={adminData} columns={[
           { header: 'Name', accessor: 'name', className: 'p-4 font-bold text-sm text-gray-900 dark:text-white' },
           { header: 'Role', render: (r)=><span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded text-xs font-bold">{r.role}</span>, className: 'p-4 text-center' },
           { header: 'Actions', render: (row) => <UserActionButtons row={row} type="admin" />, className: 'p-4 text-center' }
         ]} />
      </div>
    </div>
  );

  const TableView = ({ title, columns, data, addButtonText, onAdd }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 animate-fade-in relative min-h-[500px] transition-colors">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">{title}</h2>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"><DataTable columns={columns} data={data} /></div>
      {addButtonText && <div className="absolute bottom-8 right-8"><button onClick={onAdd} className="bg-[#afa2ba] dark:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-purple-400 dark:hover:bg-purple-700">{addButtonText}</button></div>}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#dcd3e2] dark:bg-gray-950 text-purple-800 dark:text-purple-400 font-bold">Loading Dashboard...</div>;

  return (
    // ADDED: dark:bg-gray-950
    <div className="min-h-screen bg-[#dcd3e2] dark:bg-gray-950 font-sans relative transition-colors duration-300">
      {showAddPropertyModal && <AddPropertyModal onClose={() => setShowAddPropertyModal(false)} onSave={() => { setShowAddPropertyModal(false); refreshData(); }} />}
      {showUserModal.open && <AddUserModal type={showUserModal.type} userToEdit={showUserModal.user} onClose={() => setShowUserModal({ open: false })} onSave={handleSaveUser} />}
      {previewImage && <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />}

      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <LocalTopBar 
            sidebarOpen={sidebarOpen} 
            showNotifs={showNotifs} 
            toggleNotifs={() => setShowNotifs(!showNotifs)} 
            unreadCount={notifications.length} 
            user={user} 
        />
        <NotificationDropdown isOpen={showNotifs} notifications={notifications} onClose={() => setShowNotifs(false)} />

        <div className="p-10 mt-24 flex-1">
          {activePage === 'dashboard' && (
             <>
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {[{l:'Revenue', v: `₱${(stats?.total_revenue || 0).toLocaleString()}`}, {l:'Users', v: stats?.total_users || 0}, {l:'Bookings', v: stats?.total_bookings || 0}].map((s,i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm flex justify-between items-center h-32 transition-colors">
                            <span className="text-4xl font-bold text-purple-400 opacity-70">{s.v}</span>
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{s.l}</span>
                        </div>
                    ))}
                </div>
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Pending Approvals</h3>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-colors">
                        <DataTable 
                            data={condoData.filter(p => p.status === 'pending')}
                            columns={[
                                { header: 'Name', accessor: 'name', className: 'p-4 font-bold dark:text-white' },
                                { header: 'Price', render: (r) => `₱${r.price_per_month?.toLocaleString()}`, className: 'p-4 dark:text-gray-300' },
                                { header: 'Status', render: (r) => <StatusPill status={r.status} />, className: 'p-4 text-center' },
                                { header: 'Actions', render: (row) => (
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={()=>handlePropertyAction(row.id, 'approve')} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600">Accept</button>
                                        <button onClick={()=>handlePropertyAction(row.id, 'reject')} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-200">Decline</button>
                                    </div>
                                ), className: 'p-4 text-center' }
                            ]}
                        />
                    </div>
                </div>
             </>
          )}
          
          {activePage === 'properties' && <TableView title="All Properties" addButtonText="Add Property" onAdd={() => setShowAddPropertyModal(true)} data={condoData} columns={[
            { header: 'Name', accessor: 'name', className: 'p-3 text-sm font-bold dark:text-white' },
            { header: 'Loc', accessor: 'address', className: 'p-3 text-sm text-gray-500 dark:text-gray-400' },
            { header: 'Price', render: (r) => `₱${r.price_per_month?.toLocaleString()}`, className: 'p-3 text-sm font-bold text-green-600 dark:text-green-400' },
            { header: 'Status', render: (r) => <StatusPill status={r.status} />, className: 'p-3 text-center' },
            { header: 'Actions', render: (row) => row.status === 'pending' ? <span className="text-xs text-yellow-600 dark:text-yellow-500 font-bold">Action Needed</span> : <span className="text-xs text-gray-400">Managed</span>, className: 'p-3 text-center' }
          ]} />}

          {activePage === 'owners' && <TableView title="Owners" data={ownersData} columns={[{ header: 'Name', accessor: 'name', className: 'p-4 font-bold dark:text-white' },{ header: 'Email', accessor: 'email', className: 'p-4 text-blue-600 dark:text-blue-400' },{ header: 'Actions', render: (row) => <UserActionButtons row={row} type="owners" />, className: 'p-4 text-center' }]} />}
          {activePage === 'tenants' && <TableView title="Tenants" data={tenantsData} columns={[{ header: 'Name', accessor: 'name', className: 'p-4 font-bold dark:text-white' },{ header: 'Email', accessor: 'email', className: 'p-4 text-blue-600 dark:text-blue-400' },{ header: 'Actions', render: (row) => <UserActionButtons row={row} type="tenants" />, className: 'p-4 text-center' }]} />}
          {activePage === 'payments' && <TableView title="Payments" data={paymentsData} columns={[
            { header: 'User', accessor: 'user', className: 'p-3 text-xs dark:text-gray-300' },{ header: 'Amount', accessor: 'amount', className: 'p-3 text-xs font-bold dark:text-white' },{ header: 'Status', render: (r)=><StatusPill status={r.status}/>, className: 'p-3 text-center' },
            { header: 'Actions', render: (row) => <span className="text-xs text-gray-400">View</span>, className: 'p-3 text-center' }
          ]} />}
          {activePage === 'admins' && <AdminsTableView />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;