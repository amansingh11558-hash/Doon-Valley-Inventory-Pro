
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Calendar, FileText, CheckCircle, Clock, AlertCircle, X, Edit2, Landmark, CreditCard, Printer, ArrowLeft, ShoppingCart, IndianRupee } from 'lucide-react';
import { PurchaseBill, PaymentMode, PaymentStatus, Vendor, Item } from '../types';

const PurchaseBilling: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<PurchaseBill | null>(null);
  const [printingBill, setPrintingBill] = useState<PurchaseBill | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  
  const [vendorSearch, setVendorSearch] = useState('');
  const [itemSearch, setItemSearch] = useState<string[]>([]);
  const [activeItemDropdown, setActiveItemDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveItemDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVendors = store.vendors.filter((v: Vendor) => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
    v.code.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const totalBill = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  const calculateStatus = (paid: number, total: number): PaymentStatus => {
    if (total === 0) return 'Unpaid';
    const p = Number(paid);
    const t = Number(total);
    if (p >= t) return 'Paid';
    if (p > 0) return 'Partial';
    return 'Unpaid';
  };

  const currentStatus = calculateStatus(paidAmount, totalBill);

  const handleAddItem = () => {
    setItems([...items, { itemId: '', itemName: '', quantity: 1, rate: 0, total: 0, salePrice: 0 }]);
    setItemSearch([...itemSearch, '']);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
    setItemSearch(itemSearch.filter((_, i) => i !== idx));
  };

  const updateItemField = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    
    if (field === 'itemId') {
      const itm = store.items.find((i: Item) => i.id === value);
      if (itm) {
        newItems[idx].salePrice = itm.salePrice;
        newItems[idx].itemName = itm.name;
      }
    }

    if (field === 'quantity' || field === 'rate') {
      const q = Number(newItems[idx].quantity) || 0;
      const r = Number(newItems[idx].rate) || 0;
      newItems[idx].total = q * r;
    }
    setItems(newItems);
  };

  const selectedVendor = store.vendors.find((v: Vendor) => v.id === vendorId);

  useEffect(() => {
    if (editingBill) {
      setVendorId(editingBill.vendorId);
      const formattedItems = editingBill.items.map(it => {
        const master = store.items.find((mi: any) => mi.id === it.itemId);
        return { ...it, itemName: master?.name || '', salePrice: master?.salePrice || 0 };
      });
      setItems(formattedItems);
      setPaidAmount(editingBill.paidAmount);
      setPaymentMode(editingBill.paymentMode);
      setItemSearch(editingBill.items.map(() => ''));
    }
  }, [editingBill, store.items]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const salePricesBatch: Record<string, number> = {};
    items.forEach(it => {
      if (it.itemId) salePricesBatch[it.itemId] = Number(it.salePrice || 0);
    });

    const billData: any = {
      date: formData.get('date') as string,
      vendorId: vendorId,
      paymentTerm: formData.get('paymentTerm') as any,
      paymentMode: paymentMode,
      paymentStatus: currentStatus,
      paidAmount: Number(paidAmount),
      remarks: formData.get('remarks') as string,
      bankName: paymentMode === 'Bank' ? (formData.get('bankName') as string) : undefined,
      ifscCode: paymentMode === 'Bank' ? (formData.get('ifscCode') as string) : undefined,
      upiId: paymentMode === 'UPI' ? (formData.get('upiId') as string) : undefined,
      items: items.map(it => ({
        itemId: it.itemId,
        quantity: Number(it.quantity),
        rate: Number(it.rate),
        total: it.total
      })),
      itemSalePrices: salePricesBatch
    };

    if (editingBill) {
      store.updatePurchase({ ...editingBill, ...billData });
    } else {
      store.createPurchase(billData);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBill(null);
    setItems([]);
    setVendorId('');
    setVendorSearch('');
    setItemSearch([]);
    setPaidAmount(0);
    setPaymentMode('Cash');
    setActiveItemDropdown(null);
  };

  if (printingBill) {
    const v = store.vendors.find((vn: any) => vn.id === printingBill.vendorId);
    return (
      <div className="bg-white p-12 max-w-4xl mx-auto shadow-2xl rounded-3xl min-h-[90vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-start mb-12 print:hidden">
          <button onClick={() => setPrintingBill(null)} className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-all bg-slate-100 px-4 py-2 rounded-xl font-bold">
            <ArrowLeft size={18} />
            <span>Back to Records</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20">
            <Printer size={18} />
            <span>Print Invoice</span>
          </button>
        </div>
        
        <div className="flex justify-between border-b-4 border-slate-900 pb-8 mb-8">
           <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase">Purchase Bill</h1>
              <p className="text-slate-500 font-bold mt-1 tracking-widest">{printingBill.invoiceNo}</p>
           </div>
           <div className="text-right">
              <p className="font-black text-xl">Doon Valley High School</p>
              <p className="text-sm text-slate-500">Inventory & Accounts Unit</p>
              <p className="text-sm text-slate-400 mt-1">Date: {new Date(printingBill.date).toLocaleDateString()}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vendor / Supplier</p>
              <h4 className="text-2xl font-bold text-slate-900">{v?.name}</h4>
              <p className="text-sm text-slate-600 mt-1">{v?.address}</p>
              <div className="mt-4 flex flex-col text-xs font-bold text-slate-500 space-y-1">
                 <span>GST: {v?.gstNo || 'N/A'}</span>
                 <span>Phone: {v?.phone}</span>
              </div>
           </div>
           <div className="text-right flex flex-col justify-center space-y-3">
              <div className="space-y-1">
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Payment status</p>
                 <span className={`px-4 py-1 rounded-full font-black text-sm uppercase border-2 ${printingBill.paymentStatus === 'Paid' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-rose-50 border-rose-500 text-rose-600'}`}>
                   {printingBill.paymentStatus}
                 </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Mode: {printingBill.paymentMode}</p>
           </div>
        </div>

        <table className="w-full text-left border-collapse mb-12">
           <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] uppercase font-black text-slate-500">
                 <th className="py-5">Inventory Description</th>
                 <th className="py-5 text-center">Qty</th>
                 <th className="py-5 text-right">Unit Rate</th>
                 <th className="py-5 text-right">Line Total</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {printingBill.items.map((it, idx) => {
                 const masterItem = store.items.find((i: any) => i.id === it.itemId);
                 return (
                    <tr key={idx} className="text-sm group">
                       <td className="py-5">
                          <p className="font-bold text-slate-900 text-lg">{masterItem?.name}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-tighter">{masterItem?.code}</p>
                       </td>
                       <td className="py-5 text-center font-black text-slate-700 text-lg">{it.quantity}</td>
                       <td className="py-5 text-right font-bold text-slate-700">₹{it.rate?.toLocaleString()}</td>
                       <td className="py-5 text-right font-black text-slate-900 text-lg">₹{it.total?.toLocaleString()}</td>
                    </tr>
                 );
              })}
           </tbody>
        </table>

        <div className="mt-auto border-t-2 border-slate-900 pt-8 flex justify-end">
           <div className="w-80 space-y-4 text-right">
              <div className="flex justify-between text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                 <span>Net Bill Amount</span>
                 <span className="font-mono text-base">₹{printingBill.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-black uppercase text-[10px] tracking-widest">
                 <span>Amount Paid To Vendor</span>
                 <span className="font-mono text-base">₹{printingBill.paidAmount.toLocaleString()}</span>
              </div>
              <div className="h-0.5 bg-slate-900"></div>
              <div className="flex justify-between items-center py-2">
                 <span className="text-lg font-black uppercase tracking-tighter">Balance Due</span>
                 <span className="text-3xl font-black font-mono text-rose-600">₹{printingBill.balanceAmount.toLocaleString()}</span>
              </div>
           </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest mt-10 italic">Purchased batch successfully integrated into school inventory system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Purchase Billing</h2>
          <p className="text-slate-500">Manage incoming stock and supplier entries</p>
        </div>
        <button 
          onClick={() => { closeModal(); setShowModal(true); handleAddItem(); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span className="font-bold">New Purchase Bill</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Invoice No</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Vendor</th>
                <th className="px-6 py-4 font-semibold text-blue-700 text-right">Bill Total / Balance</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {store.purchaseBills.map((b: PurchaseBill) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">{b.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{store.vendors.find((v: any) => v.id === b.vendorId)?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-slate-900 text-base">₹{b.totalAmount.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold uppercase mt-0.5 ${b.balanceAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      Due: ₹{b.balanceAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                      b.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                      b.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => setPrintingBill(b)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Print Invoice">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => { setEditingBill(b); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => store.deletePurchase(b.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-blue-50 sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-xl"><ShoppingCart size={24}/></div>
                 <div>
                    <h3 className="text-xl font-bold text-blue-900 leading-none">{editingBill ? 'Edit Stock Entry' : 'New Stock Batch Entry'}</h3>
                    <p className="text-[10px] font-bold uppercase text-blue-500 mt-1 tracking-widest">Real-time financial reconciliation</p>
                 </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-all"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><Calendar size={14} className="mr-1" /> Entry Date *</label>
                   <input name="date" type="date" required defaultValue={editingBill?.date || new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500" />
                 </div>
                 <div className="space-y-1 relative">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Vendor *</label>
                   <input 
                      type="text" 
                      placeholder="Search vendor SKU or Name..." 
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-t-xl outline-none focus:border-blue-500"
                   />
                   <div className="max-h-32 overflow-y-auto border-x border-b border-slate-200 rounded-b-xl bg-slate-50 shadow-inner">
                      {filteredVendors.map((v: Vendor) => (
                        <button 
                          key={v.id}
                          type="button"
                          onClick={() => { setVendorId(v.id); setVendorSearch(v.name); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b last:border-0 ${vendorId === v.id ? 'bg-blue-100 font-black text-blue-800' : ''}`}
                        >
                          {v.name} <span className="text-[10px] text-slate-400 ml-2">{v.code}</span>
                        </button>
                      ))}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Term Selection</label>
                   <select name="paymentTerm" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white outline-none font-bold">
                     <option value="Immediate">Immediate</option>
                     <option value="Net 15 Days">Net 15 Days</option>
                     <option value="Net 30 Days">Net 30 Days</option>
                   </select>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory Batch Details</h4>
                   <button type="button" onClick={handleAddItem} className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex items-center hover:bg-blue-100 transition-all"><Plus size={16} className="mr-1"/> Add Item Row</button>
                </div>
                <div className="space-y-4">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-start bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200 group">
                      <div className="col-span-12 md:col-span-4 space-y-2 relative" ref={activeItemDropdown === idx ? dropdownRef : null}>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Search & Select Catalog Item *</label>
                         <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input 
                              placeholder="Search item name or SKU..." 
                              value={it.itemName || itemSearch[idx]}
                              onFocus={() => {
                                setActiveItemDropdown(idx);
                                updateItemField(idx, 'itemName', ''); 
                              }}
                              onChange={(e) => {
                                const ns = [...itemSearch]; ns[idx] = e.target.value; setItemSearch(ns);
                                updateItemField(idx, 'itemName', e.target.value);
                              }}
                              autoComplete="off"
                              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50"
                           />
                           {activeItemDropdown === idx && (
                             <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 max-h-56 overflow-y-auto animate-in slide-in-from-top-2">
                               {store.items
                                .filter((i: any) => 
                                  i.name.toLowerCase().includes((itemSearch[idx] || '').toLowerCase()) || 
                                  i.code.toLowerCase().includes((itemSearch[idx] || '').toLowerCase())
                                ).map((i: any) => (
                                  <button 
                                    key={i.id}
                                    type="button"
                                    onClick={() => {
                                      updateItemField(idx, 'itemId', i.id);
                                      updateItemField(idx, 'itemName', i.name);
                                      setActiveItemDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b last:border-0 border-slate-50 transition-colors"
                                  >
                                    <div className="font-bold text-slate-900">{i.name}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{i.code} - Stock: {i.currentStock} - Sale Price: ₹{i.salePrice}</div>
                                  </button>
                                ))
                               }
                             </div>
                           )}
                         </div>
                      </div>
                      <div className="col-span-3 md:col-span-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Qty</label>
                         <input type="number" required min="1" value={it.quantity} onChange={(e) => updateItemField(idx, 'quantity', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-base font-black text-center outline-none focus:ring-4 focus:ring-blue-50" />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Buying Price (₹)</label>
                         <input type="number" required min="0" value={it.rate} onChange={(e) => updateItemField(idx, 'rate', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-base font-black text-rose-600 outline-none focus:ring-4 focus:ring-rose-50" />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                         <label className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Set Selling Price (₹)</label>
                         <input type="number" required min="0" value={it.salePrice} onChange={(e) => updateItemField(idx, 'salePrice', e.target.value)} className="w-full px-3 py-2.5 border border-blue-200 rounded-xl text-base font-black text-blue-700 outline-none focus:ring-4 focus:ring-blue-50 bg-white shadow-inner" />
                      </div>
                      <div className="col-span-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Line Total</label>
                         <div className="px-3 py-2.5 font-black text-slate-900 text-lg bg-white border-2 border-slate-100 rounded-xl text-right">₹{it.total?.toLocaleString() || 0}</div>
                      </div>
                      <div className="col-span-1 text-right flex items-center justify-end pb-1.5">
                         <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-600 transition-all p-2 hover:bg-rose-50 rounded-full"><Trash2 size={24} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t-2 border-slate-100">
                 <div className="space-y-8">
                    <div className="bg-slate-50 p-8 rounded-[40px] border-2 border-slate-200 space-y-8 shadow-inner">
                       <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Settlement</h5>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Mode</label>
                            <select 
                               name="paymentMode" 
                               value={paymentMode} 
                               onChange={(e) => setPaymentMode(e.target.value as PaymentMode)} 
                               className="w-full px-5 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-black outline-none shadow-sm"
                            >
                              <option value="Cash">Cash Handover</option>
                              <option value="UPI">UPI / Digital</option>
                              <option value="Bank">Bank Transfer</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Status</label>
                             <div className={`px-4 py-3 rounded-2xl text-sm font-black text-center border-2 transition-all ${currentStatus === 'Paid' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                               {currentStatus}
                             </div>
                          </div>
                       </div>

                       {paymentMode === 'Bank' && (
                         <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                           <input name="bankName" defaultValue={editingBill?.bankName || selectedVendor?.bankName} placeholder="Bank Name" className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl bg-white text-sm font-bold outline-none" />
                           <input name="ifscCode" defaultValue={editingBill?.ifscCode || selectedVendor?.ifscCode} placeholder="IFSC Code" className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl bg-white text-sm font-bold outline-none" />
                         </div>
                       )}

                       {paymentMode === 'UPI' && (
                         <input name="upiId" defaultValue={editingBill?.upiId || selectedVendor?.upiId} placeholder="UPI Reference ID" className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl bg-white text-sm font-bold outline-none animate-in slide-in-from-top-2" />
                       )}

                       <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Paid To Vendor Today (₹) *</label>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Reactive calculation active</span>
                         </div>
                         <div className="relative group">
                            <IndianRupee size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                name="paidAmount" 
                                type="number" 
                                value={paidAmount} 
                                onChange={(e) => setPaidAmount(Number(e.target.value))} 
                                className="w-full pl-14 pr-6 py-5 border-4 border-white rounded-3xl text-4xl font-black text-blue-900 outline-none shadow-xl focus:ring-8 focus:ring-blue-50 transition-all bg-blue-50/30" 
                            />
                         </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Batch Internal Memo</label>
                      <textarea name="remarks" defaultValue={editingBill?.remarks} rows={2} className="w-full px-6 py-4 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-200 focus:bg-slate-50 transition-all" placeholder="Delivery details, PO references, etc..." />
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white p-12 rounded-[50px] flex flex-col justify-between shadow-2xl relative overflow-hidden border-8 border-slate-800">
                    <div className="space-y-8 relative z-10">
                       <div className="flex justify-between items-center text-slate-400">
                          <span className="text-xs font-black uppercase tracking-widest">Gross Bill Value</span>
                          <span className="font-mono text-xl">₹{totalBill.toLocaleString()}</span>
                       </div>
                       <div className="h-0.5 bg-slate-800 rounded-full"></div>
                       <div className="space-y-2 py-4 flex flex-col items-center">
                          <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1 block text-center border border-blue-400/20 py-1 px-4 rounded-full bg-blue-400/5">Outstanding Vendor Balance</span>
                          <div className="flex flex-col items-center justify-center">
                             <span className="text-7xl font-black font-mono tracking-tighter text-white drop-shadow-lg">₹{(totalBill - paidAmount).toLocaleString()}</span>
                             <div className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Automatic stock update on confirmation</div>
                          </div>
                       </div>
                       <div className="space-y-4 pt-8 border-t-2 border-slate-800">
                          <div className="flex justify-between items-center text-emerald-400">
                             <span className="text-xs font-black uppercase tracking-widest">Amount Paid</span>
                             <span className="font-black font-mono text-xl">₹{Number(paidAmount).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="mt-12 bg-slate-800/50 p-6 rounded-3xl flex items-start space-x-3 text-[10px] font-bold text-slate-400 uppercase leading-relaxed backdrop-blur-sm border border-white/5">
                       <AlertCircle size={20} className="text-blue-500 shrink-0" />
                       <p>Note: Finalizing this transaction will overwrite the Item Master's default sale price with the prices defined in the batch rows above.</p>
                    </div>
                 </div>
              </div>

              <div className="pt-10 flex justify-end space-x-5 sticky bottom-0 bg-white pb-6 z-10 border-t border-slate-50">
                <button type="button" onClick={closeModal} className="px-10 py-4 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-100 rounded-3xl transition-all border-2 border-transparent hover:border-slate-200">Discard</button>
                <button type="submit" className="px-16 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40 flex items-center space-x-3 active:scale-95">
                  <CheckCircle size={24} />
                  <span>{editingBill ? 'Apply Updates' : 'Confirm Stock Batch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseBilling;
