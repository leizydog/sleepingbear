import React, { useState, useMemo } from 'react';
import Sidebar from '../../components/organisms/Sidebar'; 
import DataTable from '../../components/organisms/DataTable'; 
import Icon from '../../components/atoms/Icon';

// ==========================================
// 🛎️ LOCAL COMPONENT: TOP BAR (With Notification Logic)
// ==========================================
// We define this here so the Notification Button works immediately with the dashboard state
const LocalTopBar = ({ sidebarOpen, toggleNotifs, showNotifs, unreadCount }) => {
  return (
    <div className={`fixed top-0 right-0 z-40 flex items-center justify-between px-8 py-4 bg-[#f4f2f6]/80 backdrop-blur-md transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-20'}`}>
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
        <p className="text-xs text-gray-500 font-medium">Welcome back, Admin</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="bg-white flex items-center px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 w-64">
          <Icon name="Search" size={18} className="text-gray-400" />
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-600" />
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={toggleNotifs}
            className={`p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 relative ${showNotifs ? 'bg-[#afa2ba] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Icon name="Bell" size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 leading-none">Admin User</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Super Admin</p>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-[#afa2ba] to-purple-300 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white">
            <Icon name="User" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🔔 SUB-COMPONENT: NOTIFICATION DROPDOWN
// ==========================================
const NotificationDropdown = ({ notifications, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800">Notifications</h3>
        <button className="text-xs text-[#afa2ba] font-bold hover:underline">Mark all read</button>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
        ) : (
          notifications.map((notif, index) => (
            <div key={index} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 relative group">
              {/* Icon based on type */}
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                notif.type === 'property' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <Icon name={
                  notif.type === 'payment' ? 'CreditCard' :
                  notif.type === 'property' ? 'Home' : 'Calendar'
                } size={18} />
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">{notif.category}</p>
                <p className="text-sm font-bold text-gray-800 leading-snug">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
              </div>
              
              {/* Blue Dot for Unread */}
              <div className="absolute right-4 top-6 h-2 w-2 bg-blue-500 rounded-full"></div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
        <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-800">Close Notifications</button>
      </div>
    </div>
  );
};

// ==========================================
// 🖼️ SUB-COMPONENT: IMAGE PREVIEW MODAL
// ==========================================
const ImagePreviewModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative bg-white p-2 rounded-xl max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-200 transition-all z-10"><Icon name="X" size={24} /></button>
        <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center min-h-[400px]">
           <div className="text-center w-full">
             <div className="w-full h-80 bg-gray-200 flex items-center justify-center mb-4 text-6xl text-gray-400"><Icon name="Image" size={64} /></div>
             <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Proof of Payment Preview</p>
             <code className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-600">{src}</code>
           </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🎨 SUB-COMPONENT: ADD PROPERTY MODAL
// ==========================================
const AddPropertyModal = ({ onClose, onSave }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-slide-up border border-white/20">
        <div className="bg-[#afa2ba] px-8 py-6 flex justify-between items-center">
          <div><h3 className="text-2xl font-extrabold text-white tracking-wide">Add New Property</h3></div>
          <button onClick={onClose} className="text-white bg-white/10 hover:bg-white/30 rounded-full p-2 transition-all"><Icon name="X" size={20} /></button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Condo Name</label><input type="text" placeholder="e.g. SMDC Grass" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba]" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Unit</label><input type="text" placeholder="e.g. 24-B" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba]" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2">Price</label><input type="number" placeholder="0.00" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba]" /></div>
           </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl text-sm">Cancel</button>
          <button onClick={onSave} className="px-10 py-3 bg-[#afa2ba] text-white font-bold rounded-xl shadow-lg hover:bg-[#9a8a9b] text-sm">Save Property</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 👤 SUB-COMPONENT: ADD/EDIT USER MODAL
// ==========================================
const AddUserModal = ({ type, userToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: userToEdit?.name || '',
    email: userToEdit?.email || '',
    contact: userToEdit?.contact || '',
    role: userToEdit?.role || 'Moderator',
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up">
        <div className="bg-[#afa2ba] px-8 py-6 flex justify-between items-center">
          <div><h3 className="text-xl font-extrabold text-white tracking-wide">{userToEdit ? 'Edit' : 'Add'} {type === 'admin' ? 'Admin' : type === 'owners' ? 'Owner' : 'Tenant'}</h3></div>
          <button onClick={onClose} className="text-white bg-white/10 hover:bg-white/30 rounded-full p-2"><Icon name="X" size={20} /></button>
        </div>
        <div className="p-8 space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label><input value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} className="w-full border rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba]" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} className="w-full border rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba]" /></div>
          {type !== 'admin' && <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact</label><input value={formData.contact} onChange={(e)=>setFormData({...formData,contact:e.target.value})} className="w-full border rounded-xl py-3 px-4 outline-none focus:border-[#afa2ba]" /></div>}
          {type === 'admin' && <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label><select value={formData.role} onChange={(e)=>setFormData({...formData,role:e.target.value})} className="w-full border rounded-xl py-3 px-4 outline-none bg-white"><option>Super Admin</option><option>Moderator</option><option>Support</option></select></div>}
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-xl text-sm">Cancel</button>
          <button onClick={()=>onSave({...userToEdit, ...formData})} className="px-6 py-2 bg-[#afa2ba] text-white font-bold rounded-xl shadow-lg hover:bg-[#9a8a9b] text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 MAIN COMPONENT: ADMIN DASHBOARD
// ==========================================
const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  
  // --- UI STATES ---
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState({ open: false, type: null, user: null });
  const [previewImage, setPreviewImage] = useState(null);

  // --- DATA STATES ---
  const [ownersData, setOwnersData] = useState([
    { id: 'OW001', name: 'Maria Gomez', email: 'maria@example.com', contact: '0917-123-4567', units: 4 },
    { id: 'OW002', name: 'John Reyes', email: 'john.reyes@gmail.com', contact: '0920-456-7890', units: 2 },
  ]);

  const [tenantsData, setTenantsData] = useState([
    { id: 'TN001', name: 'Jericho Santos', email: 'jericho.s@gmail.com', contact: '0918-555-1234', bookings: 3 },
    { id: 'TN002', name: 'Angela Tan', email: 'angela_tan@yahoo.com', contact: '0906-222-7890', bookings: 1 },
  ]);

  const [adminData, setAdminData] = useState([
    { id: 'ADM01', name: 'Joe Sardoma', email: 'joesardoma@gmail.com', role: 'Super Admin', status: 'Active' },
    { id: 'ADM02', name: 'Maria Santos', email: 'marias@gmail.com', role: 'Support Staff', status: 'Active' },
  ]);

  const [condoData, setCondoData] = useState([
    { id: 'PRT001', unit: 'Studio Type', type: 'Residential', name: 'SMDC Grass', loc: 'BGC', price: '₱18,000.00', status: 'Active', owner: 'Maria Gomez' },
    { id: 'PRT002', unit: '2-Bedroom', type: 'Mixed-Use', name: 'The Rise', loc: 'Makati', price: '₱25,000.00', status: 'Pending', owner: 'John Reyes' },
  ]);

  const [paymentsData, setPaymentsData] = useState([
    { id: 'PMT001', user: 'TN001', condo: 'SMDC Grass', address: 'Tower 1, 2405', amount: '₱18,000.00', method: 'GCash', proof: 'receipt_001.jpg', date: 'Jun 15', status: 'Confirmed' },
    { id: 'PMT002', user: 'TN002', condo: 'The Rise', address: 'North Wing, 12B', amount: '₱25,000.00', method: 'Bank', proof: 'bdo_99.png', date: 'Jun 14', status: 'Pending' },
  ]);

  // --- 🔔 NOTIFICATIONS LOGIC (Auto-generated) ---
  const notifications = useMemo(() => {
    const notifs = [];
    paymentsData.forEach(p => { if (p.status === 'Pending') notifs.push({ type: 'payment', category: 'Payment Alert', message: `Pending payment of ${p.amount} from ${p.user}`, time: p.date }); });
    condoData.forEach(c => { if (c.status === 'Pending') notifs.push({ type: 'property', category: 'Listing Request', message: `New property pending: ${c.name}`, time: 'Recent' }); });
    tenantsData.slice(0, 1).forEach(t => { notifs.push({ type: 'booking', category: 'New Booking', message: `${t.name} registered as a new tenant.`, time: 'Just now' }); });
    return notifs;
  }, [paymentsData, condoData, tenantsData]);

  // --- HANDLERS ---
  const handleSaveUser = (userData) => {
    const isEdit = !!userData.id;
    const type = showUserModal.type; 
    let prefix = type === 'owners' ? 'OW' : type === 'admin' ? 'ADM' : 'TN';
    const newData = { ...userData, id: isEdit ? userData.id : `${prefix}${Math.floor(Math.random()*1000)}`, units: userData.units||0, bookings: userData.bookings||0, status: 'Active' };
    const setter = type === 'owners' ? setOwnersData : type === 'admin' ? setAdminData : setTenantsData;
    setter(prev => isEdit ? prev.map(u => u.id === newData.id ? newData : u) : [...prev, newData]);
    setShowUserModal({ open: false, type: null, user: null });
  };

  const handleDeleteUser = (id, type) => {
    if(!window.confirm("Remove user?")) return;
    const setter = type === 'owners' ? setOwnersData : type === 'admin' ? setAdminData : setTenantsData;
    setter(prev => prev.filter(u => u.id !== id));
  };

  const handlePropertyAction = (id, action) => setCondoData(prev => prev.map(i => i.id === id ? { ...i, status: action === 'approve' ? 'Active' : 'Rejected' } : i));
  const handlePaymentAction = (id, action) => setPaymentsData(prev => prev.map(p => p.id === id ? { ...p, status: action === 'accept' ? 'Confirmed' : 'Declined' } : p));

  // --- HELPERS ---
  const StatusPill = ({ status }) => {
    let color = (status === 'Active' || status === 'Confirmed') ? 'text-green-600 bg-green-50' : status === 'Pending' ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
    return <span className={`px-2 py-1 rounded-full font-bold ${color} text-xs border border-current/10`}>{status}</span>;
  };

  const UserActionButtons = ({ row, type }) => (
    <div className="flex justify-center gap-3 text-xs font-bold">
      <button onClick={() => setShowUserModal({ open: true, type, user: row })} className="text-blue-500 hover:text-blue-700">Edit</button>|
      <button onClick={() => handleDeleteUser(row.id, type)} className="text-red-500 hover:text-red-700">Delete</button>
    </div>
  );

  // --- SETTINGS VIEW ---
  const SettingsView = () => (
    <div className="animate-fade-in max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
        <div className="h-24 bg-[#afa2ba]"></div>
        <div className="px-6 pb-6 relative">
          <div className="w-24 h-24 bg-white rounded-full absolute -top-12 border-4 border-white shadow-sm flex items-center justify-center"><Icon name="User" size={40} className="text-gray-400"/></div>
          <div className="mt-14"><h3 className="text-xl font-bold text-gray-800">Admin User</h3><p className="text-sm text-gray-500">Super Administrator</p>
          <div className="mt-6 space-y-4 text-sm text-gray-600"><div className="flex gap-3"><Icon name="Mail" size={16}/> admin@system.com</div><div className="flex gap-3"><Icon name="Phone" size={16}/> +63 917 000 0000</div></div></div>
        </div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <div className="flex justify-between mb-6">
           <div><h3 className="text-xl font-bold">Team Management</h3><p className="text-sm text-gray-500">Manage admins</p></div>
           <button onClick={() => setShowUserModal({ open: true, type: 'admin' })} className="bg-[#afa2ba] text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"><Icon name="Plus" size={16}/> Add Admin</button>
         </div>
         <DataTable data={adminData} columns={[
           { header: 'Name', accessor: 'name', className: 'p-4 font-bold text-sm' },
           { header: 'Role', render: (r)=><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">{r.role}</span>, className: 'p-4 text-center' },
           { header: 'Actions', render: (row) => <UserActionButtons row={row} type="admin" />, className: 'p-4 text-center' }
         ]} />
      </div>
    </div>
  );

  // --- TABLE VIEW WRAPPER ---
  const TableView = ({ title, columns, data, addButtonText, onAdd }) => (
    <div className="bg-white rounded-xl shadow-sm p-8 animate-fade-in relative min-h-[500px]">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6">{title}</h2>
      <div className="border border-gray-200 rounded-lg overflow-hidden"><DataTable columns={columns} data={data} /></div>
      {addButtonText && <div className="absolute bottom-8 right-8"><button onClick={onAdd} className="bg-[#afa2ba] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-purple-400">{addButtonText}</button></div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#dcd3e2] font-sans relative">
      
      {/* --- MOUNT MODALS --- */}
      {showAddPropertyModal && <AddPropertyModal onClose={() => setShowAddPropertyModal(false)} onSave={() => setShowAddPropertyModal(false)} />}
      {showUserModal.open && <AddUserModal type={showUserModal.type} userToEdit={showUserModal.user} onClose={() => setShowUserModal({ open: false })} onSave={handleSaveUser} />}
      {previewImage && <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />}

      {/* --- LAYOUT --- */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        
        {/* 🛎️ LOCAL TOPBAR WITH NOTIFICATION TOGGLE */}
        <LocalTopBar 
           sidebarOpen={sidebarOpen} 
           showNotifs={showNotifs} 
           toggleNotifs={() => setShowNotifs(!showNotifs)} 
           unreadCount={notifications.length}
        />
        
        {/* 🔔 NOTIFICATION DROPDOWN PANEL */}
        <NotificationDropdown 
           isOpen={showNotifs} 
           notifications={notifications} 
           onClose={() => setShowNotifs(false)} 
        />

        <div className="p-10 mt-24 flex-1">
          
          {/* DASHBOARD */}
          {activePage === 'dashboard' && <div className="grid grid-cols-3 gap-6">{[{l:'Owners',v:ownersData.length},{l:'Tenants',v:tenantsData.length},{l:'Properties',v:condoData.length}].map((s,i)=><div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex justify-between items-center h-32"><span className="text-6xl font-bold text-purple-400 opacity-70">{s.v}</span><span className="text-lg font-bold text-gray-700">Total {s.l}</span></div>)}</div>}
          
          {/* OWNERS */}
          {activePage === 'owners' && <TableView title="Owners" addButtonText="Add Owner" onAdd={() => setShowUserModal({ open: true, type: 'owners' })} data={ownersData} columns={[{ header: 'Name', accessor: 'name', className: 'p-4 font-bold' },{ header: 'Email', accessor: 'email', className: 'p-4 text-blue-600' },{ header: 'Units', accessor: 'units', className: 'p-4 text-center' },{ header: 'Actions', render: (row) => <UserActionButtons row={row} type="owners" />, className: 'p-4 text-center' }]} />}
          
          {/* TENANTS */}
          {activePage === 'tenants' && <TableView title="Tenants" addButtonText="Add Tenant" onAdd={() => setShowUserModal({ open: true, type: 'tenants' })} data={tenantsData} columns={[{ header: 'Name', accessor: 'name', className: 'p-4 font-bold' },{ header: 'Email', accessor: 'email', className: 'p-4 text-blue-600' },{ header: 'Bookings', accessor: 'bookings', className: 'p-4 text-center' },{ header: 'Actions', render: (row) => <UserActionButtons row={row} type="tenants" />, className: 'p-4 text-center' }]} />}

          {/* PROPERTIES */}
          {activePage === 'properties' && <TableView title="Properties" addButtonText="Add Property" onAdd={() => setShowAddPropertyModal(true)} data={condoData} columns={[
            { header: 'Name', accessor: 'name', className: 'p-3 text-xs font-bold' },{ header: 'Loc', accessor: 'loc', className: 'p-3 text-xs' },{ header: 'Price', accessor: 'price', className: 'p-3 text-xs font-bold text-green-600' },{ header: 'Status', render: (r)=><StatusPill status={r.status}/>, className: 'p-3 text-center' },
            { header: 'Actions', render: (row) => row.status === 'Pending' ? <div className="flex gap-2 justify-center"><button onClick={()=>handlePropertyAction(row.id, 'approve')} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">Accept</button><button onClick={()=>handlePropertyAction(row.id, 'reject')} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold">Decline</button></div> : <span className="text-xs text-gray-400">Managed</span>, className: 'p-3 text-center min-w-[160px]' }
          ]} />}

          {/* PAYMENTS */}
          {activePage === 'payments' && <TableView title="Payments" data={paymentsData} columns={[
            { header: 'User', accessor: 'user', className: 'p-3 text-xs' },{ header: 'Address', accessor: 'address', className: 'p-3 text-xs text-gray-500' },{ header: 'Amount', accessor: 'amount', className: 'p-3 text-xs font-bold' },
            { header: 'Proof', render: (r)=><button onClick={()=>setPreviewImage(r.proof)} className="text-purple-600 underline text-xs font-bold">VIEW</button>, className: 'p-3 text-center' },
            { header: 'Status', render: (r)=><StatusPill status={r.status}/>, className: 'p-3 text-center' },
            { header: 'Actions', render: (row) => row.status !== 'Pending' ? <span className="text-xs text-gray-400">Done</span> : <div className="flex gap-2 justify-center"><button onClick={()=>handlePaymentAction(row.id, 'accept')} className="bg-green-100 text-green-700 p-1.5 rounded"><Icon name="Check" size={16}/></button><button onClick={()=>handlePaymentAction(row.id, 'decline')} className="bg-red-100 text-red-700 p-1.5 rounded"><Icon name="X" size={16}/></button></div>, className: 'p-3 text-center' }
          ]} />}

          {/* PLACEHOLDERS */}
          {activePage === 'reports' && <div className="p-10 text-center bg-white rounded-xl shadow-sm">Reports Module Placeholder</div>}
          
          {/* SETTINGS */}
          {activePage === 'settings' && <SettingsView />}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;