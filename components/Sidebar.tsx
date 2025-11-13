import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, ProductIcon, ReportIcon, SettingsIcon, CashierIcon } from './Icons';
import { useStore } from '../context/StoreContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/products', label: 'Produk', icon: ProductIcon },
  { path: '/cashier', label: 'Kasir', icon: CashierIcon },
  { path: '/reports', label: 'Laporan', icon: ReportIcon },
  { path: '/settings', label: 'Pengaturan', icon: SettingsIcon },
];

const Sidebar: React.FC = () => {
  const { state } = useStore();

  return (
    <aside className="w-64 flex-shrink-0 bg-white shadow-md hidden md:flex flex-col">
      <div className="h-20 flex items-center justify-center bg-[#4A90E2] text-white">
        <h1 className="text-2xl font-bold">KasirKu</h1>
      </div>
      <div className="p-4 flex items-center space-x-3 border-b">
        <img src={state.settings.logoUrl} alt="Store Logo" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h2 className="font-semibold text-gray-800">{state.settings.name}</h2>
          <p className="text-sm text-gray-500">Admin</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#4A90E2] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;