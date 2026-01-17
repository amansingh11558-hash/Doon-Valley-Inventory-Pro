
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  ClipboardList, 
  Settings, 
  Bell, 
  LogOut,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useInventoryStore } from './store';
import Dashboard from './components/Dashboard';
import VendorManagement from './components/Vendors';
import ItemManagement from './components/Items';
import PurchaseBilling from './components/PurchaseBills';
import SalesBilling from './components/SalesBills';
import Reports from './components/Reports';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const store = useInventoryStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'items', label: 'Item Master', icon: Package },
    { id: 'purchase', label: 'Purchases', icon: ShoppingCart },
    { id: 'sales', label: 'Issues / Sales', icon: ArrowUpRight },
    { id: 'reports', label: 'Reports & Logs', icon: ClipboardList },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard store={store} setTab={setActiveTab} />;
      case 'vendors': return <VendorManagement store={store} />;
      case 'items': return <ItemManagement store={store} />;
      case 'purchase': return <PurchaseBilling store={store} />;
      case 'sales': return <SalesBilling store={store} />;
      case 'reports': return <Reports store={store} />;
      default: return <Dashboard store={store} setTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">Doon Valley</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Inventory Pro</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
