import React from 'react';
import Icon from '../atoms/Icon'; 

// IMPORT LOGO
import logo from '../../assets/logo.jpg'; 

const Sidebar = ({ activePage, setActivePage, isOpen, toggleSidebar }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid' },
    { id: 'owners', label: 'Owners', icon: 'Users' },
    { id: 'tenants', label: 'Tenants', icon: 'UserCheck' },
    { id: 'properties', label: 'Condominiums', icon: 'Home' },
    { id: 'payments', label: 'Payments', icon: 'CircleDollarSign' },
    { id: 'reports', label: 'Generate Reports', icon: 'TrendingUp' },
    // Updated ID to match AdminDashboard logic
    { id: 'audit', label: 'Audit Trail', icon: 'ClipboardList' }, 
  ];

  return (
    <div className={`bg-[#afa2ba] text-white h-screen fixed left-0 top-0 transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-72' : 'w-24'}`}>
      
      {/* Header with Logo */}
      <div className={`p-4 flex items-center gap-3 mb-6 transition-all ${isOpen ? 'justify-start' : 'justify-center'}`}>
        
        <img 
            src={logo} 
            alt="Sleeping Bear Logo" 
            className="w-14 h-14 rounded-xl object-cover shadow-lg border-2 border-white/20 shrink-0"
        />

        {isOpen && (
          <div className="leading-tight overflow-hidden whitespace-nowrap">
            <h2 className="font-extrabold text-lg text-purple-900">Sleeping Bear</h2>
            <p className="text-[10px] text-purple-800 font-bold uppercase">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold text-lg group ${
                isActive 
                  ? 'bg-[#89cff0] text-white border-l-4 border-white shadow-sm' 
                  : 'text-white hover:bg-white/10'
              } ${!isOpen && 'justify-center'}`}
            >
              <Icon name={item.icon} size={24} strokeWidth={2.5} className="shrink-0" />
              
              {isOpen && <span className="ml-4">{item.label}</span>}
              
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                  <div className="absolute left-20 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                  </div>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  );
};

export default Sidebar;