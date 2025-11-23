import React from 'react';
import Icon from '../atoms/Icon'; 

const Sidebar = ({ activePage, setActivePage, isOpen, toggleSidebar }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid' },
    { id: 'owners', label: 'Owners', icon: 'Users' },
    { id: 'tenants', label: 'Tenants', icon: 'UserCheck' },
    { id: 'properties', label: 'Condominiums', icon: 'Home' },
    { id: 'payments', label: 'Payments', icon: 'CircleDollarSign' },
    { id: 'reports', label: 'Generate Reports', icon: 'TrendingUp' },
    { id: 'settings', label: 'Manage Account', icon: 'UserCog' }, // Mapped to Manage Account based on image
  ];

  const bottomItems = [
    { id: 'config', label: 'Settings', icon: 'Settings' },
    { id: 'logout', label: 'Log Out', icon: 'LogOut' },
  ];

  return (
    <div className={`bg-[#afa2ba] text-white h-screen fixed left-0 top-0 transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-72' : 'w-20'}`}>
      
      {/* Header */}
      <div className="p-6 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center text-xl shadow-md shrink-0">
          🐻
        </div>
        {isOpen && (
          <div className="leading-tight">
            <h2 className="font-extrabold text-lg text-purple-900">Sleeping Bear</h2>
            <p className="text-[10px] text-purple-800">Property Rentals and For Sale</p>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-r-full transition-all duration-200 font-bold text-lg ${
                isActive 
                  ? 'bg-[#89cff0] text-white border-l-4 border-white shadow-sm' // Light blue active state
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon name={item.icon} size={24} strokeWidth={2.5} />
              {isOpen && <span className="ml-4">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="px-4 pb-8 space-y-2 border-t border-white/20 pt-4">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center px-4 py-3 rounded-r-full text-white hover:bg-white/10 font-bold text-lg transition-all"
          >
            <Icon name={item.icon} size={24} strokeWidth={2.5} />
            {isOpen && <span className="ml-4">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;