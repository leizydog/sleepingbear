import React, { useState, useEffect } from 'react';
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
import { Rocket, User, Shield, Save } from 'lucide-react'; // Added icons for Settings View

// --- TOP BAR ---
const LocalTopBar = ({ sidebarOpen, toggleNotifs, showNotifs, unreadCount, user, setActivePage }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={`fixed top-0 right-0 z-40 flex items-center justify-between px-8 py-4 bg-[#f4f2f6]/80 backdrop-blur-md transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-20'}`}>
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
        <p className="text-xs text-gray-500 font-medium">Welcome back, {user?.full_name || 'Admin'}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-white flex items-center px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 w-64 hidden md:flex">
          <Icon name="Search" size={18} className="text-gray-400" />
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-600" />
        </div>

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 leading-none">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{user?.role || 'Super Admin'}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-[#afa2ba] to-purple-300 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white overflow-hidden">
              <Icon name="User" size={20} />
            </div>
            <Icon name="ChevronDown" size={16} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-slide-up overflow-hidden">
                <div className="p-2 border-b border-gray-50 space-y-1">
                  <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">System</p>
                  
                  {/* 1. MANAGE ACCOUNT -> Goes to 'admins' tab */}
                  <button onClick={() => { setDropdownOpen(false); setActivePage('admins'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:bg-purple-50 rounded-lg flex items-center gap-2">
                    <Icon name="Users" size={16} /> Manage Account
                  </button>
                  
                  {/* 2. SETTINGS -> Stays in Dashboard, switches to 'settings' tab */}
                  <button onClick={() => { setDropdownOpen(false); setActivePage('settings'); }} className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:bg-purple-50 rounded-lg flex items-center gap-2">
                    <Icon name="Settings" size={16} /> Settings
                  </button>
                </div>
                <div className="p-2">
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
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

// --- INTERNAL SETTINGS VIEW (COMING SOON) ---
const AdminSettingsView = () => (
  <div className="relative h-[600px] w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* OVERLAY */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border border-gray-100 max-w-md">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket size={40} className="text-[#afa2ba] animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Admin Settings</h2>
              <p className="text-gray-500 mb-6">
                  We are currently building advanced system configurations and profile management for admins.
              </p>
              <span className="bg-[#afa2ba] text-white text-xs font-bold px-3 py-1 rounded-full">COMING SOON</span>
          </div>
      </div>

      {/* BACKGROUND MOCK UI (Blurred) */}
      <div className="p-8 filter blur-sm opacity-40 pointer-events-none select-none">
          <h2 className="text-xl font-bold text-gray-800 mb-6">General Configuration</h2>
          <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Admin Name</label>
                      <div className="flex items-center border rounded-lg p-3 bg-gray-50"><User size={16} className="mr-2 text-gray-400"/> System Admin</div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">System Email</label>
                      <div className="flex items-center border rounded-lg p-3 bg-gray-50"><Icon name="Mail" size={16} className="mr-2 text-gray-400"/> admin@sleepingbear.com</div>
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Security Level</label>
                  <div className="flex items-center border rounded-lg p-3 bg-gray-50"><Shield size={16} className="mr-2 text-gray-400"/> High (2FA Enabled)</div>
              </div>
              <div className="flex justify-end pt-4">
                  <button className="bg-gray-300 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={16}/> Save Changes</button>
              </div>
          </div>
      </div>
  </div>
);

// --- MODALS (User, Property, Image) ---
const AddUserModal = ({ type, userToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: userToEdit?.name || '', email: userToEdit?.email || '', role: type || 'tenant', password: '' });
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up">
        <div className="bg-[#afa2ba] px-8 py-6 flex justify-between items-center">
          <h3 className="text-xl font-extrabold text-white">{userToEdit ? 'Edit' : 'Add'} {type}</h3>
          <button onClick={onClose} className="text-white"><Icon name="X" size={20}/></button>
        </div>
        <div className="p-8 space-y-4">
            <input className="w-full border p-3 rounded-xl" placeholder="Name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} />
            <input className="w-full border p-3 rounded-xl" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} />
            {!userToEdit && <input className="w-full border p-3 rounded-xl" type="password" placeholder="Password" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} />}
        </div>
        <div className="p-6 bg-gray-50 flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
            <button onClick={()=>onSave(formData)} className="px-6 py-2 bg-[#afa2ba] text-white font-bold rounded-xl">Save</button>
        </div>
      </div>
    </div>
  );
};

const AddPropertyModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', price_per_month: '', images: [] });
  
  const handleFile = (e) => {
      const files = Array.from(e.target.files);
      if(files.length) setFormData({...formData, images: files.map(f => URL.createObjectURL(f))});
  };

  const handleSubmit = () => {
      if(formData.images.length < 1) { alert("Upload 1 image"); return; }
      onSave();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-slide-up">
        <div className="bg-[#afa2ba] px-8 py-6"><h3 className="text-white font-bold text-xl">Add Property</h3></div>
        <div className="p-8 space-y-4">
            <input className="w-full border p-3 rounded-xl" placeholder="Property Name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} />
            <input className="w-full border p-3 rounded-xl" type="number" placeholder="Price" value={formData.price_per_month} onChange={e=>setFormData({...formData,price_per_month:e.target.value})} />
            <div className="border-2 border-dashed p-6 text-center rounded-xl relative">
                <input type="file" multiple onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer"/>
                <p>{formData.images.length > 0 ? `${formData.images.length} images selected` : "Click to upload images"}</p>
            </div>
        </div>
        <div className="p-6 bg-gray-50 flex justify-end gap-4">
            <button onClick={onClose} className="px-4 font-bold text-gray-500">Cancel</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-[#afa2ba] text-white font-bold rounded-xl">Save Property</button>
        </div>
      </div>
    </div>
  );
};

const ImagePreviewModal = ({ src, onClose }) => { return src ? <div onClick={onClose}>Preview</div> : null; }; 

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const { user } = useAuth();
  
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState({ open: false, type: null, user: null });
  const [previewImage, setPreviewImage] = useState(null);

  // Mock Data for Demo
  const [condoData, setCondoData] = useState([]);
  const [ownersData, setOwnersData] = useState([]);
  const [tenantsData, setTenantsData] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
      // Mock Loading Data
      setLoading(true);
      setTimeout(() => {
          setCondoData([{id:1, name:'Grass Residences', address:'QC', price_per_month:25000, status:'pending'}]);
          setOwnersData([{id:1, name:'John Owner', email:'john@owner.com', unit_list:'Unit 101', status:'Active'}]);
          setTenantsData([{id:1, name:'Jane Tenant', email:'jane@tenant.com', booking_request:'Booking #101', status:'Pending'}]);
          setAdminData([{id:1, name:'Super Admin', email:'admin@sb.com', role:'Super Admin', status:'Active'}]);
          setPaymentsData([{id:1, user:'User #1', amount:5000, status:'verified'}]);
          setLoading(false);
      }, 500);
  };

  useEffect(() => { refreshData(); }, []);

  // Actions
  const handleAction = (type) => alert(`${type} action triggered`);
  const handleSaveUser = () => { alert("User Saved"); setShowUserModal({open:false}); };

  // Helpers
  const StatusPill = ({ status }) => <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase">{status}</span>;
  
  const TableView = ({ title, columns, data, addButtonText, onAdd }) => (
    <div className="bg-white rounded-xl shadow-sm p-8 animate-fade-in relative min-h-[500px]">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6">{title}</h2>
      <div className="border border-gray-200 rounded-lg overflow-hidden"><DataTable columns={columns} data={data} /></div>
      {addButtonText && <div className="absolute bottom-8 right-8"><button onClick={onAdd} className="bg-[#afa2ba] text-white px-6 py-3 rounded-xl font-bold shadow-md flex gap-2"><Icon name="Plus" size={18}/> {addButtonText}</button></div>}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#dcd3e2] font-sans relative">
      {showAddPropertyModal && <AddPropertyModal onClose={() => setShowAddPropertyModal(false)} onSave={() => { setShowAddPropertyModal(false); refreshData(); }} />}
      {showUserModal.open && <AddUserModal type={showUserModal.type} userToEdit={showUserModal.user} onClose={() => setShowUserModal({ open: false })} onSave={handleSaveUser} />}
      {previewImage && <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />}

      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <LocalTopBar sidebarOpen={sidebarOpen} showNotifs={showNotifs} toggleNotifs={() => setShowNotifs(!showNotifs)} unreadCount={0} user={user} setActivePage={setActivePage} />
        
        <div className="p-10 mt-24 flex-1">
          {activePage === 'dashboard' && (
             <div className="text-center text-gray-500 font-bold mt-10">Dashboard Widgets Placeholder</div>
          )}
          
          {activePage === 'properties' && <TableView title="Properties" addButtonText="Add Property" onAdd={()=>setShowAddPropertyModal(true)} data={condoData} columns={[{header:'Name', accessor:'name'}, {header:'Status', render:(r)=><StatusPill status={r.status}/>}, {header:'Action', render:()=><button onClick={()=>handleAction('Accept')}>Accept</button>}]} />}
          
          {activePage === 'owners' && <TableView title="Owners" data={ownersData} columns={[{header:'Name', accessor:'name'}, {header:'Units', accessor:'unit_list'}, {header:'Action', render:()=><button onClick={()=>handleAction('Edit')}>Edit</button>}]} />}
          
          {activePage === 'tenants' && <TableView title="Tenants" data={tenantsData} columns={[{header:'Name', accessor:'name'}, {header:'Booking', accessor:'booking_request'}, {header:'Action', render:()=><button onClick={()=>handleAction('Accept')}>Accept</button>}]} />}
          
          {activePage === 'admins' && <TableView title="Admins" addButtonText="Add Admin" onAdd={()=>setShowUserModal({open:true, type:'admin'})} data={adminData} columns={[{header:'Name', accessor:'name'}, {header:'Role', accessor:'role'}, {header:'Action', render:()=><button onClick={()=>handleAction('Edit')}>Edit</button>}]} />}
          
          {activePage === 'audit_trail' && <div className="p-10 bg-white rounded-xl text-center font-bold text-gray-400">Audit Trail Logs</div>}

          {/* --- NEW SETTINGS VIEW (INSIDE DASHBOARD) --- */}
          {activePage === 'settings' && <AdminSettingsView />}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;