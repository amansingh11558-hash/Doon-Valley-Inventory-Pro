
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Landmark, CreditCard } from 'lucide-react';
import { Vendor, PaymentTerm } from '../types';

const VendorManagement: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');

  const filteredVendors = store.vendors.filter((v: Vendor) => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorData = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      gstNo: formData.get('gstNo') as string,
      paymentTerms: formData.get('paymentTerms') as PaymentTerm,
      bankName: formData.get('bankName') as string,
      ifscCode: formData.get('ifscCode') as string,
      accountNumber: formData.get('accountNumber') as string,
      upiId: formData.get('upiId') as string,
    };

    if (editingVendor) {
      store.updateVendor({ ...editingVendor, ...vendorData });
    } else {
      store.addVendor(vendorData);
    }
    setShowModal(false);
    setEditingVendor(null);
  };

  const openEdit = (v: Vendor) => {
    setEditingVendor(v);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vendor Master</h2>
          <p className="text-slate-500">Manage suppliers and payment details</p>
        </div>
        <button 
          onClick={() => { setEditingVendor(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add New Vendor</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Vendor Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Payment Details</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.map((v: Vendor) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-blue-600">{v.code}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500 font-mono">GST: {v.gstNo || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{v.contactPerson}</div>
                    <div className="text-xs text-slate-500">{v.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {v.bankName && <div className="text-slate-700">Bank: {v.bankName} ({v.ifscCode})</div>}
                    {v.upiId && <div className="text-blue-600">UPI: {v.upiId}</div>}
                    <div className="mt-1"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase tracking-tighter">{v.paymentTerms}</span></div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(v)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => store.deleteVendor(v.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No vendors found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Vendor Name *</label>
                  <input name="name" required defaultValue={editingVendor?.name} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Contact Person *</label>
                  <input name="contactPerson" required defaultValue={editingVendor?.contactPerson} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input name="email" type="email" defaultValue={editingVendor?.email} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
                  <input name="phone" required defaultValue={editingVendor?.phone} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Address *</label>
                  <textarea name="address" required defaultValue={editingVendor?.address} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">GST Number</label>
                  <input name="gstNo" defaultValue={editingVendor?.gstNo} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Payment Terms *</label>
                  <select name="paymentTerms" required defaultValue={editingVendor?.paymentTerms || 'Immediate'} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center uppercase tracking-wider">
                  <Landmark size={16} className="mr-2" /> Bank & Digital Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Bank Name</label>
                    <input name="bankName" defaultValue={editingVendor?.bankName} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">IFSC Code</label>
                    <input name="ifscCode" defaultValue={editingVendor?.ifscCode} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Account Number</label>
                    <input name="accountNumber" defaultValue={editingVendor?.accountNumber} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 flex items-center"><CreditCard size={14} className="mr-1"/> UPI ID</label>
                    <input name="upiId" defaultValue={editingVendor?.upiId} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
