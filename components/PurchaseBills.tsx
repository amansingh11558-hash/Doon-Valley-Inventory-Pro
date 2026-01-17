
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Trash2, Calendar, FileText, CheckCircle, 
  Clock, AlertCircle, X, Edit2, Landmark, CreditCard, 
  Printer, ArrowLeft, ShoppingCart, IndianRupee,
  // Added HandCoins to the import list
  HandCoins
} from 'lucide-react';
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
      <div className="bg-white p-12 max-w-4xl mx-auto shadow-2xl rounded-3xl min-h-[90vh] flex flex-col border border-slate-200 print:shadow-none print:border-none print:p-0">
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
              <h1 className="text-4xl font-black text-slate-900 uppercase italic">Purchase Bill</h1>
              <p className="text-slate-500 font-bold mt-1 tracking-widest font-mono">NO: {printingBill.invoiceNo}</p>
           </div>
           <div className="text-right">
              <p className="font-black text-2xl text-slate-900">Doon Valley High School</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Inventory Management Dept.</p>
              <p className="text-sm text-slate-400 mt-1">Date: {new Date(printingBill.date).toLocaleDateString()}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">From Vendor</p>
              <h4 className="text-2xl font-black text-slate-900">{v?.name}</h4>
              <p className="text-sm text-slate-600 mt-1">{v?.address}</p>
              <div className="mt-4 flex flex-col text-xs font-bold text-slate-500 space-y-1">
                 <span>GST: {v?.gstNo || 'N/A'}</span>
                 <span>Phone: {v?.phone}</span>
              </div>
           </div>
           <div className="text-right flex flex-col justify-center space-y-3">
              <div className="space-y-1">
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Payment Status</p>
                 <span className={`px-4 py-1 rounded-full font-black text-sm uppercase border-2 ${printingBill.paymentStatus === 'Paid' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-rose-50 border-rose-500 text-rose-600'}`}>
                   {printingBill.paymentStatus}
                 </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Mode: {printingBill.paymentMode}</p>
           </div>
        </div>

        <table className="w-full text-left border-collapse mb-auto">
           <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] uppercase font-black text-slate-500">
                 <th className="py-5">Item Description</th>
                 <th className="py-5 text-center">Qty</th>
                 <th className="py-5 text-right">Purchase Rate</th>
                 <th className="py-5 text-right">Amount</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {printingBill.items.map((it, idx) => {
                 const masterItem = store.items.find((i: any) => i.id === it.itemId);
                 return (
                    <tr key={idx} className="text-sm group">
                       <td className="py-5">
                          <p className="font-black text-slate-900 text-lg">{masterItem?.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Code: {masterItem?.code}</p>
                       </td>
                       <td className="py-5 text-center font-black text-slate-700 text-lg">{it.quantity}</td>
                       <td className="py-5 text-right font-bold text-slate-700">₹{it.rate?.toLocaleString()}</td>
                       <td className="py-5 text-right font-black text-slate-900 text-lg">₹{it.total?.toLocaleString()}</td>
                    </tr>
                 );
              })}
           </tbody>
        </table>

        {/* ARRANGED AMOUNT SECTION FOR PURCHASE */}
        <div className="mt-auto border-t-4 border-slate-900 pt-10 flex justify-end">
           <div className="w-96 space-y-4">
              <div className="flex justify-between items-center text-slate-500 font-black uppercase text-xs tracking-widest px-4">
                 <span>Gross Bill Total</span>
                 <span className="font-mono text-lg">₹{printingBill.totalAmount.toLocaleString()}</span>
              </div>
              <div className="h-0.5 bg-slate-200 mx-4"></div>
              <div className="flex justify-between items-center text-emerald-600 font-black uppercase text-xs tracking-widest pt-2 px-4">
                 <span>Amount Paid</span>
                 <span className="font-mono text-xl">₹{printingBill.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-rose-50 text-rose-600 p-6 rounded-[28px] border-2 border-rose-100">
                 <span className="text-sm font-black uppercase tracking-widest">Balance Payable</span>
                 <span className="text-3xl font-black font-mono">₹{printingBill.balanceAmount.toLocaleString()}</span>
              </div>
           </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest mt-12 italic">Goods received and verified for institutional use.</p>
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
          onClick={() => { setEditingBill(null); closeModal(); setShowModal(true); handleAddItem(); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span className="font-bold">New Purchase Bill</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-black tracking-widest">
                <th className="px-6 py-5">Invoice No</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Vendor</th>
                <th className="px-6 py-5 text-right">Total / Balance</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {store.purchaseBills.map((b: PurchaseBill) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-blue-600">{b.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{store.vendors.find((v: any) => v.id === b.vendorId)?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-slate-900 text-base">₹{b.totalAmount.toLocaleString()}</div>
                    <div className={`text-[10px] font-black uppercase mt-0.5 ${b.balanceAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      Due: ₹{b.balanceAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase border-2 ${
                      b.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      b.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => setPrintingBill(b)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => { setEditingBill(b); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => store.deletePurchase(b.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-6xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50 sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                 <div className="p-3 bg-blue-600 text-white rounded-[20px] shadow-lg shadow-blue-200"><ShoppingCart size={28}/></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">{editingBill ? 'Edit Stock Batch' : 'New Stock Batch Registration'}</h3>
                    <p className="text-[10px] font-black uppercase text-blue-500 mt-1.5 tracking-widest">Institutional Master Price Reconciliation</p>
                 </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-3 hover:bg-slate-200 rounded-full transition-all"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 flex-1 overflow-y-auto space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center"><Calendar size={14} className="mr-2" /> Entry Date *</label>
                   <input name="date" type="date" required defaultValue={editingBill?.date || new Date().toISOString().split('T')[0]} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50" />
                 </div>
                 <div className="space-y-2 relative">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Source Vendor *</label>
                   <input 
                      type="text" 
                      placeholder="Search name or code..." 
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full px-5 py-3 border-2 border-slate-100 rounded-t-2xl outline-none focus:border-blue-500 bg-slate-50/50"
                   />
                   <div className="max-h-32 overflow-y-auto border-x-2 border-b-2 border-slate-100 rounded-b-2xl bg-white shadow-inner">
                      {filteredVendors.map((v: Vendor) => (
                        <button 
                          key={v.id}
                          type="button"
                          onClick={() => { setVendorId(v.id); setVendorSearch(v.name); }}
                          className={`w-full text-left px-5 py-3 text-sm hover:bg-blue-50 border-b last:border-0 ${vendorId === v.id ? 'bg-blue-100 font-black text-blue-800 underline' : ''}`}
                        >
                          {v.name} <span className="text-[10px] text-slate-400 ml-2 font-mono">{v.code}</span>
                        </button>
                      ))}
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Payment Terms</label>
                   <select name="paymentTerm" className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl bg-white outline-none font-black text-sm focus:ring-4 focus:ring-blue-50">
                     <option value="Immediate">Immediate</option>
                     <option value="Net 15 Days">Net 15 Days</option>
                     <option value="Net 30 Days">Net 30 Days</option>
                   </select>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-4 border-slate-50 pb-4">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Batch Inventory Detail</h4>
                   <button type="button" onClick={handleAddItem} className="text-[10px] font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl border-2 border-blue-100 flex items-center hover:bg-blue-100 transition-all shadow-sm"><Plus size={16} className="mr-2"/> Add Row</button>
                </div>
                <div className="space-y-5">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-5 items-end bg-slate-50/50 p-8 rounded-[40px] border-2 border-slate-100 transition-all hover:border-blue-200 hover:bg-white shadow-sm group">
                      <div className="col-span-12 md:col-span-4 space-y-2 relative" ref={activeItemDropdown === idx ? dropdownRef : null}>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Catalog Selection *</label>
                         <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                           <input 
                              placeholder="SKU or Name..." 
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
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-8 focus:ring-blue-50 focus:border-blue-400"
                           />
                           {activeItemDropdown === idx && (
                             <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl z-20 max-h-56 overflow-y-auto animate-in slide-in-from-top-2">
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
                                    className="w-full text-left px-5 py-4 hover:bg-emerald-50 border-b last:border-0 border-slate-50 transition-colors"
                                  >
                                    <div className="font-black text-slate-900 text-base">{i.name}</div>
                                    <div className="flex justify-between items-center mt-1.5">
                                       <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{i.code}</span>
                                       <span className="text-[10px] font-black uppercase text-blue-600">Stock: {i.currentStock} | Price: ₹{i.salePrice}</span>
                                    </div>
                                  </button>
                                ))
                               }
                             </div>
                           )}
                         </div>
                      </div>
                      <div className="col-span-3 md:col-span-1 space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Qty</label>
                         <input type="number" required min="1" value={it.quantity} onChange={(e) => updateItemField(idx, 'quantity', e.target.value)} className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl text-lg font-black text-center outline-none focus:ring-8 focus:ring-blue-50" />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Purchase ₹</label>
                         <input type="number" required min="0" value={it.rate} onChange={(e) => updateItemField(idx, 'rate', e.target.value)} className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl text-lg font-black text-rose-600 outline-none focus:ring-8 focus:ring-rose-50" />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2">Institutional Sale ₹</label>
                         <input type="number" required min="0" value={it.salePrice} onChange={(e) => updateItemField(idx, 'salePrice', e.target.value)} className="w-full px-4 py-3.5 border-2 border-blue-100 rounded-2xl text-lg font-black text-blue-700 outline-none focus:ring-8 focus:ring-blue-50 bg-white" />
                      </div>
                      <div className="col-span-2 md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Line Total</label>
                         <div className="px-4 py-3.5 font-black text-slate-900 text-xl bg-white border-4 border-slate-50 rounded-2xl text-right shadow-inner">₹{it.total?.toLocaleString() || 0}</div>
                      </div>
                      <div className="col-span-1 text-right flex items-center justify-end pb-3">
                         <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-600 transition-all p-3 hover:bg-rose-50 rounded-full"><Trash2 size={24} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t-8 border-slate-50">
                 <div className="space-y-10">
                    <div className="bg-slate-50 p-10 rounded-[48px] border-4 border-white space-y-10 shadow-2xl">
                       <div className="flex items-center space-x-3">
                          <HandCoins size={24} className="text-blue-600" />
                          <h5 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Settlement Logic</h5>
                       </div>
                       <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Mode</label>
                            <select 
                               name="paymentMode" 
                               value={paymentMode} 
                               onChange={(e) => setPaymentMode(e.target.value as PaymentMode)} 
                               className="w-full px-5 py-4 border-2 border-slate-200 rounded-[24px] bg-white text-sm font-black outline-none shadow-sm focus:ring-8 focus:ring-blue-50"
                            >
                              <option value="Cash">Cash Account</option>
                              <option value="UPI">UPI Transfer</option>
                              <option value="Bank">Bank NEFT/IMPS</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</label>
                             <div className={`px-5 py-4 rounded-[24px] text-sm font-black text-center border-4 transition-all ${currentStatus === 'Paid' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                               {currentStatus}
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3 pt-4 border-t border-slate-200">
                         <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Amount Paid to Vendor (₹) *</label>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Updating balance due</span>
                         </div>
                         <div className="relative group">
                            <IndianRupee size={32} className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                name="paidAmount" 
                                type="number" 
                                value={paidAmount} 
                                onChange={(e) => setPaidAmount(Number(e.target.value))} 
                                className="w-full pl-16 pr-8 py-6 border-4 border-white rounded-[32px] text-5xl font-black text-blue-900 outline-none shadow-xl focus:ring-12 focus:ring-blue-50 transition-all bg-blue-50/20" 
                            />
                         </div>
                       </div>
                    </div>
                    <div className="space-y-3 px-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Institutional Note / Remark</label>
                      <textarea name="remarks" defaultValue={editingBill?.remarks} rows={2} className="w-full px-8 py-6 border-4 border-slate-50 rounded-[32px] outline-none focus:border-blue-100 focus:bg-slate-50 transition-all text-sm font-medium" placeholder="PO reference or quality notes..." />
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white p-12 rounded-[64px] flex flex-col justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden group border-[12px] border-slate-800/50">
                    <div className="space-y-10 relative z-10">
                       <div className="flex justify-between items-center text-slate-400">
                          <span className="text-xs font-black uppercase tracking-[0.2em]">Gross Bill Total</span>
                          <span className="font-mono text-2xl">₹{totalBill.toLocaleString()}</span>
                       </div>
                       <div className="h-0.5 bg-slate-800 rounded-full"></div>
                       <div className="space-y-3 py-6 text-center">
                          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] block border border-blue-400/20 py-1.5 rounded-full bg-blue-400/5">Vendor Credit Balance</span>
                          <div className="flex flex-col items-center justify-center">
                             <span className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">₹{(totalBill - paidAmount).toLocaleString()}</span>
                             <div className="text-[10px] text-slate-500 font-bold uppercase mt-3 tracking-[0.2em]">Institutional Payable Liability</div>
                          </div>
                       </div>
                       <div className="space-y-6 pt-10 border-t-2 border-slate-800/80">
                          <div className="flex justify-between items-center text-emerald-400/80">
                             <span className="text-xs font-black uppercase tracking-[0.1em]">Settled (Paid)</span>
                             <span className="font-black font-mono text-2xl">₹{Number(paidAmount).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="mt-12 bg-white/5 p-6 rounded-3xl flex items-start space-x-4 text-[10px] font-bold text-slate-400 uppercase leading-relaxed backdrop-blur-md border border-white/5">
                       <AlertCircle size={20} className="text-blue-500 shrink-0" />
                       <p>Closing this transaction will instantly add stock to inventory and update master sale prices for all listed items.</p>
                    </div>
                 </div>
              </div>

              <div className="pt-12 flex justify-end space-x-6 sticky bottom-0 bg-white pb-8 z-10 border-t-2 border-slate-50">
                <button type="button" onClick={closeModal} className="px-12 py-5 text-slate-500 font-black uppercase tracking-[0.2em] hover:bg-slate-100 rounded-[32px] transition-all border-2 border-transparent hover:border-slate-200 active:scale-95">Discard</button>
                <button type="submit" className="px-20 py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-[32px] hover:bg-blue-700 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] flex items-center space-x-4 active:scale-95 group">
                  <CheckCircle size={28} className="group-hover:rotate-12 transition-transform"/>
                  <span>{editingBill ? 'Commit Updates' : 'Confirm Stock Batch'}</span>
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
