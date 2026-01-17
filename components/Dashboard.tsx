
import React from 'react';
import { TrendingUp, TrendingDown, Package, Users, AlertCircle, ShoppingCart, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC<{ store: any; setTab: (t: string) => void }> = ({ store, setTab }) => {
  const totalVendors = store.vendors.length;
  const totalItems = store.items.length;
  const lowStockItems = store.items.filter((it: any) => it.currentStock <= it.minStockLevel);
  const totalDue = store.salesBills.reduce((sum: number, b: any) => sum + (b.finalAmount - b.paidAmount), 0);

  const stats = [
    { id: 'items', label: 'Total Items', value: totalItems, icon: Package, color: 'bg-blue-500' },
    { id: 'vendors', label: 'Total Vendors', value: totalVendors, icon: Users, color: 'bg-emerald-500' },
    { id: 'items', label: 'Low Stock Alerts', value: lowStockItems.length, icon: AlertCircle, color: 'bg-amber-500' },
    { id: 'sales', label: 'Total Outstandings', value: `₹${totalDue.toLocaleString()}`, icon: TrendingDown, color: 'bg-rose-500' },
  ];

  const chartData = store.purchaseBills.slice(-5).map((b: any) => ({
    name: b.invoiceNo.split('-').pop(),
    amount: b.totalAmount
  }));

  const stockPieData = [
    { name: 'Healthy', value: totalItems - lowStockItems.length },
    { name: 'Low Stock', value: lowStockItems.length },
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => setTab(stat.id)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-blue-400 hover:shadow-md transition-all group outline-none"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Open</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Recent Purchase Trends</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Stock Health</h4>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-2">
               <div className="flex items-center text-xs"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div> Healthy</div>
               <div className="flex items-center text-xs"><div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div> Low</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-lg font-bold text-slate-900">Low Stock Items</h4>
            <button onClick={() => setTab('items')} className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockItems.length > 0 ? lowStockItems.map((it: any) => (
              <div key={it.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{it.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{it.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-rose-600 font-bold">{it.currentStock}</p>
                  <p className="text-xs text-slate-400">Min: {it.minStockLevel}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">All stock levels are healthy!</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setTab('purchase')} className="flex flex-col items-center justify-center p-6 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
              <Plus className="mb-2" />
              <span className="text-sm font-bold">New Purchase</span>
            </button>
            <button onClick={() => setTab('sales')} className="flex flex-col items-center justify-center p-6 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Plus className="mb-2" />
              <span className="text-sm font-bold">Issue Item</span>
            </button>
            <button onClick={() => setTab('vendors')} className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
              <Users className="mb-2" />
              <span className="text-sm font-bold">Add Vendor</span>
            </button>
            <button onClick={() => setTab('items')} className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
              <Package className="mb-2" />
              <span className="text-sm font-bold">Add Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
