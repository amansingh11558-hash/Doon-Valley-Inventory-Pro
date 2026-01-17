
import React from 'react';
import { History, ShieldCheck, Database, Trash, Edit, Plus } from 'lucide-react';
import { AuditLog } from '../types';

const Reports: React.FC<{ store: any }> = ({ store }) => {
  const getIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus size={14} className="text-emerald-500" />;
      case 'EDIT': return <Edit size={14} className="text-blue-500" />;
      case 'DELETE': return <Trash size={14} className="text-rose-500" />;
      default: return <Plus size={14} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit & Logs</h2>
          <p className="text-slate-500">System-wide transaction and modification history</p>
        </div>
        <div className="flex space-x-2">
           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center space-x-2">
             <ShieldCheck size={18} className="text-emerald-500" />
             <span className="text-sm font-semibold">Audit Integrity: Secure</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1">
           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center"><Database size={16} className="mr-2"/> Database Stats</h4>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-slate-600">Total Purchase Transactions</span>
                 <span className="font-bold text-slate-900">{store.purchaseBills.length}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-600">Total Issue Transactions</span>
                 <span className="font-bold text-slate-900">{store.salesBills.length}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-600">Master Item Count</span>
                 <span className="font-bold text-slate-900">{store.items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-600">Registered Vendors</span>
                 <span className="font-bold text-slate-900">{store.vendors.length}</span>
              </div>
           </div>
         </div>

         <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <h4 className="text-sm font-bold text-slate-900 flex items-center"><History size={16} className="mr-2"/> Activity Feed</h4>
               <span className="text-[10px] font-bold text-slate-400 uppercase">Showing last 100 actions</span>
            </div>
            <div className="overflow-y-auto max-h-[500px] divide-y divide-slate-50">
               {store.logs.map((log: AuditLog) => (
                 <div key={log.id} className="p-4 flex items-start space-x-4 hover:bg-slate-50/50">
                    <div className="mt-1 p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                       {getIcon(log.action)}
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900">{log.details}</p>
                          <span className="text-[10px] font-medium text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                       </div>
                       <div className="flex items-center space-x-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">{log.module}</span>
                          <span className="text-[10px] text-slate-400">by {log.user}</span>
                       </div>
                    </div>
                 </div>
               ))}
               {store.logs.length === 0 && (
                 <div className="p-12 text-center text-slate-400 italic">No activity logs recorded yet.</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;
