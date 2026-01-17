
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Trash2, Calendar, FileText, X, Edit2, 
  IndianRupee, Tag, CheckCircle, Printer, ArrowLeft, 
  Wallet, TrendingUp, HandCoins, AlertCircle, Package, ShoppingCart 
} from 'lucide-react';
import { SalesBill, IssuedToType, PaymentMode, PaymentStatus, Item } from '../types';

const SalesBilling: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<SalesBill | null>(null);
  const [printingBill, setPrintingBill] = useState<SalesBill | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [itemSearch, setItemSearch] = useState<string[]>([]);
  const [activeItemDropdown, setActiveItemDropdown] = useState<number | null>(null);
  const [issuedToType, setIssuedToType] = useState<IssuedToType>('Student');
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');

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

  // Real-time calculation for the active modal
  const totalBillRaw = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  const finalBillAmount = Math.max(0, totalBillRaw - Number(discount));
  const currentBalanceDue = Math.max(0, finalBillAmount - Number(paidAmount));

  const calculatePaymentStatus = (paid: number, total: number): PaymentStatus => {
    if (total === 0) return 'Unpaid';
    const p = Number(paid);
    const t = Number(total);
    if (p >= t) return 'Paid';
    if (p > 0) return 'Partial';
    return 'Unpaid';
  };

  const currentStatusAuto = calculatePaymentStatus(paidAmount, finalBillAmount);

  const handleAddNewItemRow = () => {
    setItems([...items, { itemId: '', itemName: '', quantity: 1, rate: 0, total: 0 }]);
    setItemSearch([...itemSearch, '']);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
    setItemSearch(itemSearch.filter((_, i) => i !== idx));
  };

  const handleUpdateItemField = (idx: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[idx][field] = value;
    
    if (field === 'itemId') {
      const master = store.items.find((i: Item) => i.id === value);
      if (master) {
        updatedItems[idx].rate = master.salePrice || 0;
        updatedItems[idx].itemName = master.name;
      }
    }

    if (field === 'quantity' || field === 'rate' || field === 'itemId') {
      const q = Number(updatedItems[idx].quantity) || 0;
      const r = Number(updatedItems[idx].rate) || 0;
      updatedItems[idx].total = q * r;
    }
    setItems(updatedItems);
  };

  useEffect(() => {
    if (editingBill) {
      const formatted = editingBill.items.map(it => {
        const master = store.items.find((mi: any) => mi.id === it.itemId);
        return { ...it, itemName: master?.name || '' };
      });
      setItems(formatted);
      setItemSearch(editingBill.items.map(() => ''));
      setIssuedToType(editingBill.issuedToType);
      setDiscount(editingBill.discount);
      setPaidAmount(editingBill.paidAmount);
      setPaymentMode(editingBill.paymentMode);
    }
  }, [editingBill, store.items]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const billData: any = {
      date: formData.get('date') as string,
      issuedTo: formData.get('issuedTo') as string,
      issuedToType: issuedToType,
      otherRecipientName: issuedToType === 'Other' ? (formData.get('otherRecipientName') as string) : undefined,
      items: items.map(it => ({
        itemId: it.itemId,
        quantity: Number(it.quantity),
        rate: Number(it.rate),
        total: it.total
      })),
      totalAmount: totalBillRaw,
      discount: Number(discount),
      finalAmount: finalBillAmount,
      paidAmount: Number(paidAmount),
      paymentStatus: currentStatusAuto,
      paymentMode: paymentMode,
      bankName: paymentMode === 'Bank' ? (formData.get('bankName') as string) : undefined,
      upiId: paymentMode === 'UPI' ? (formData.get('upiId') as string) : undefined,
      remarks: formData.get('remarks') as string,
    };

    if (editingBill) {
      store.updateSales({ ...editingBill, ...billData });
    } else {
      store.createSales(billData);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBill(null);
    setItems([]);
    setItemSearch([]);
    setDiscount(0);
    setPaidAmount(0);
    setIssuedToType('Student');
    setActiveItemDropdown(null);
  };

  if (printingBill) {
    return (
      <div className="bg-white p-12 max-w-4xl mx-auto shadow-2xl rounded-[40px] min-h-[90vh] flex flex-col border border-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start mb-12 print:hidden">
          <button onClick={() => setPrintingBill(null)} className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-all bg-slate-100 px-5 py-2.5 rounded-2xl font-bold">
            <ArrowLeft size={18} />
            <span>Back to Records</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-2.5 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition-all">
            <Printer size={18} />
            <span>Print Invoice</span>
          </button>
        </div>
        
        <div className="flex justify-between items-start border-b-8 border-slate-900 pb-10 mb-10">
           <div>
              <h1 className="text-6xl font-black text-slate-900 uppercase italic leading-tight">Invoice</h1>
              <p className="text-slate-500 font-black mt-2 tracking-[0.2em] text-sm font-mono">BILL NO: {printingBill.invoiceNo}</p>
           </div>
           <div className="text-right">
              <p className="font-black text-3xl text-slate-900">Doon Valley High School</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional Inventory Receipt</p>
              <p className="text-xs text-slate-900 font-black mt-4 uppercase">Date: {new Date(printingBill.date).toLocaleDateString()}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-16 mb-16">
           <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Issued To Information</p>
              <h4 className="text-3xl font-black text-slate-900">{printingBill.issuedTo}</h4>
              <div className="flex items-center space-x-2 mt-3">
                 <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full shadow-sm">{printingBill.issuedToType}</span>
                 {printingBill.otherRecipientName && <span className="text-sm font-bold text-slate-600 italic">| {printingBill.otherRecipientName}</span>}
              </div>
           </div>
           <div className="flex flex-col justify-center text-right space-y-4">
              <div className="space-y-1">
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Payment Status</p>
                 <span className={`px-6 py-2 rounded-2xl text-xl font-black uppercase inline-block border-4 ${printingBill.paymentStatus === 'Paid' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-rose-50 border-rose-500 text-rose-600'}`}>
                   {printingBill.paymentStatus}
                 </span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Payment Mode: {printingBill.paymentMode}</div>
           </div>
        </div>

        <table className="w-full text-left border-collapse mb-auto">
           <thead>
              <tr className="border-b-4 border-slate-900 text-[11px] uppercase font-black text-slate-500">
                 <th className="py-6 w-3/5">Item Details</th>
                 <th className="py-6 text-center">Qty</th>
                 <th className="py-6 text-right">Unit Price</th>
                 <th className="py-6 text-right">Total</th>
              </tr>
           </thead>
           <tbody className="divide-y-2 divide-slate-100">
              {printingBill.items.map((it, idx) => {
                 const masterItem = store.items.find((i: any) => i.id === it.itemId);
                 return (
                    <tr key={idx} className="text-sm">
                       <td className="py-6">
                          <p className="font-black text-slate-900 text-xl">{masterItem?.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Code: {masterItem?.code}</p>
                       </td>
                       <td className="py-6 text-center font-black text-slate-800 text-xl">{it.quantity}</td>
                       <td className="py-6 text-right font-bold text-slate-600">₹{it.rate?.toLocaleString()}</td>
                       <td className="py-6 text-right font-black text-slate-900 text-xl">₹{it.total?.toLocaleString()}</td>
                    </tr>
                 );
              })}
           </tbody>
        </table>

        {/* ARRANGED AMOUNT SECTION */}
        <div className="mt-20 border-t-8 border-slate-900 pt-12 flex justify-between items-end">
           <div className="max-w-xs space-y-6">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks / Memo</p>
                 <p className="text-sm text-slate-600 italic font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{printingBill.remarks || 'No additional remarks provided.'}</p>
              </div>
              <div className="pt-10">
                 <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Signature</p>
              </div>
           </div>
           <div className="w-96 space-y-5">
              <div className="flex justify-between items-center text-slate-500 font-black uppercase text-xs tracking-widest px-4">
                 <span>Subtotal Amount</span>
                 <span className="font-mono text-lg">₹{printingBill.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-rose-500 font-black uppercase text-xs tracking-widest px-4">
                 <span>Less: Discount</span>
                 <span className="font-mono text-lg">- ₹{printingBill.discount.toLocaleString()}</span>
              </div>
              <div className="h-0.5 bg-slate-200 mx-4"></div>
              <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-[28px] shadow-2xl">
                 <span className="text-sm font-black uppercase tracking-widest">Net Payable</span>
                 <span className="text-4xl font-black font-mono">₹{printingBill.finalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 font-black uppercase text-xs tracking-widest pt-4 px-4">
                 <span>Amount Received</span>
                 <span className="font-mono text-xl">₹{printingBill.paidAmount.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between items-center font-black uppercase text-xs tracking-widest px-4 pb-4 ${printingBill.finalAmount - printingBill.paidAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                 <span>Balance Outstanding</span>
                 <span className="font-mono text-xl">₹{(printingBill.finalAmount - printingBill.paidAmount).toLocaleString()}</span>
              </div>
           </div>
        </div>
        <p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] mt-16 italic">Thank you for your cooperation | Doon Valley High School</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Issues & Sales</h2>
          <p className="text-slate-500">Inventory disbursement logs and collection tracking</p>
        </div>
        <button 
          onClick={() => { setEditingBill(null); handleCloseModal(); setShowModal(true); handleAddNewItemRow(); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span className="font-bold">New Sales / Issue Bill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-blue-200 transition-colors">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoiced Value</p>
            <h3 className="text-2xl font-black text-slate-900">₹{store.salesBills.reduce((s: any, b: any) => s + b.finalAmount, 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-emerald-200 transition-colors">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <HandCoins size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Collection</p>
            <h3 className="text-2xl font-black text-emerald-600">₹{store.salesBills.reduce((s: any, b: any) => s + b.paidAmount, 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-rose-200 transition-colors">
          <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding</p>
            <h3 className="text-2xl font-black text-rose-600">₹{store.salesBills.reduce((s: any, b: any) => s + (b.finalAmount - b.paidAmount), 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-black tracking-widest">
                <th className="px-6 py-5">Invoice</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Recipient</th>
                <th className="px-6 py-5 text-right">Net Total / Balance</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {store.salesBills.map((b: SalesBill) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-emerald-600">{b.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900">{b.issuedTo}</div>
                    <div className="text-[10px] font-black uppercase text-slate-400">{b.issuedToType}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-slate-900 text-base">₹{b.finalAmount?.toLocaleString()}</div>
                    <div className={`text-[10px] font-black uppercase mt-0.5 ${(b.finalAmount - b.paidAmount) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      Bal: ₹{(b.finalAmount - b.paidAmount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border-2 ${b.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => setPrintingBill(b)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => { setEditingBill(b); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => store.deleteSales(b.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-6xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                 <div className="p-3 bg-emerald-600 text-white rounded-[20px] shadow-lg shadow-emerald-200"><ShoppingCart size={28}/></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">{editingBill ? 'Edit Transaction' : 'Record New Sale'}</h3>
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mt-1.5">Real-time Financial Calculation</p>
                 </div>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-3 hover:bg-slate-200 rounded-full transition-all"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-10 flex-1 overflow-y-auto space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Bill Date *</label>
                   <input name="date" type="date" required defaultValue={editingBill?.date || new Date().toISOString().split('T')[0]} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 bg-slate-50/50" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Recipient Name *</label>
                   <input name="issuedTo" required defaultValue={editingBill?.issuedTo} placeholder="e.g. Sam Winston" className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 bg-slate-50/50" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Recipient Type</label>
                   <select 
                      value={issuedToType} 
                      onChange={(e) => setIssuedToType(e.target.value as IssuedToType)} 
                      className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl bg-white outline-none font-black text-sm focus:ring-4 focus:ring-emerald-100"
                   >
                     <option value="Student">Student</option>
                     <option value="Teacher">Teacher</option>
                     <option value="Other">Other Staff/Dept</option>
                   </select>
                 </div>
                 {issuedToType === 'Other' && (
                   <div className="space-y-2 animate-in slide-in-from-left">
                     <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">Specify Detail *</label>
                     <input name="otherRecipientName" required defaultValue={editingBill?.otherRecipientName} placeholder="Admin / Sports Lab" className="w-full px-5 py-3 border-2 border-blue-100 bg-blue-50 rounded-2xl outline-none" />
                   </div>
                 )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-4 border-slate-50 pb-4">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Inventory Items</h4>
                   <button type="button" onClick={handleAddNewItemRow} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-2xl border-2 border-emerald-100 flex items-center hover:bg-emerald-100 transition-all shadow-sm"><Plus size={16} className="mr-2"/> Add Row</button>
                </div>
                <div className="space-y-5">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-5 items-end bg-slate-50/50 p-8 rounded-[40px] border-2 border-slate-100 transition-all hover:border-emerald-200 hover:bg-white shadow-sm group">
                      <div className="col-span-12 md:col-span-5 space-y-2 relative" ref={activeItemDropdown === idx ? dropdownRef : null}>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Select Item *</label>
                         <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                placeholder="Type Item SKU or Name..." 
                                value={it.itemName || itemSearch[idx]}
                                onFocus={() => {
                                  setActiveItemDropdown(idx);
                                  handleUpdateItemField(idx, 'itemName', '');
                                }}
                                onChange={(e) => {
                                  const ns = [...itemSearch]; ns[idx] = e.target.value; setItemSearch(ns);
                                  handleUpdateItemField(idx, 'itemName', e.target.value);
                                }}
                                autoComplete="off"
                                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-8 focus:ring-emerald-50 focus:border-emerald-400"
                            />
                            {activeItemDropdown === idx && (
                              <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl z-20 max-h-60 overflow-y-auto animate-in slide-in-from-top-2">
                                {store.items
                                 .filter((i: any) => 
                                   i.name.toLowerCase().includes((itemSearch[idx] || '').toLowerCase()) || 
                                   i.code.toLowerCase().includes((itemSearch[idx] || '').toLowerCase())
                                 ).map((i: any) => (
                                   <button 
                                     key={i.id}
                                     type="button"
                                     onClick={() => {
                                       handleUpdateItemField(idx, 'itemId', i.id);
                                       handleUpdateItemField(idx, 'itemName', i.name);
                                       setActiveItemDropdown(null);
                                     }}
                                     className="w-full text-left px-5 py-4 hover:bg-emerald-50 border-b last:border-0 border-slate-50 transition-colors"
                                   >
                                     <div className="font-black text-slate-900 text-base">{i.name}</div>
                                     <div className="flex justify-between items-center mt-1.5">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{i.code}</span>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${i.currentStock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                          STOCK: {i.currentStock} | ₹{i.salePrice}
                                        </span>
                                     </div>
                                   </button>
                                 ))
                                }
                              </div>
                            )}
                         </div>
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Quantity</label>
                         <input type="number" required min="1" value={it.quantity} onChange={(e) => handleUpdateItemField(idx, 'quantity', e.target.value)} className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl text-lg font-black text-center outline-none focus:ring-8 focus:ring-emerald-50" />
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Unit Rate (₹)</label>
                         <input type="number" required min="0" value={it.rate} onChange={(e) => handleUpdateItemField(idx, 'rate', e.target.value)} className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl text-lg font-black text-emerald-700 outline-none focus:ring-8 focus:ring-emerald-50" />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Line Total</label>
                         <div className="px-4 py-3.5 font-black text-slate-900 text-xl bg-white border-4 border-slate-50 rounded-2xl text-right shadow-inner">₹{it.total?.toLocaleString() || 0}</div>
                      </div>
                      <div className="col-span-1 text-right flex items-center justify-end pb-3">
                         <button type="button" onClick={() => handleRemoveItemRow(idx)} className="text-slate-300 hover:text-rose-600 transition-all p-3 hover:bg-rose-50 rounded-full"><Trash2 size={24} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REAL-TIME CALCULATION FOOTER SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t-8 border-slate-50">
                 <div className="space-y-10">
                    <div className="bg-slate-50 p-10 rounded-[48px] border-4 border-white space-y-10 shadow-2xl">
                       <div className="flex items-center space-x-3">
                          <HandCoins size={24} className="text-emerald-600" />
                          <h5 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Collection Summary</h5>
                       </div>
                       <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Mode</label>
                            <select 
                               value={paymentMode} 
                               onChange={(e) => setPaymentMode(e.target.value as PaymentMode)} 
                               className="w-full px-5 py-4 border-2 border-slate-200 rounded-[24px] bg-white text-sm font-black outline-none shadow-sm focus:ring-8 focus:ring-emerald-50"
                            >
                              <option value="Cash">Cash Handover</option>
                              <option value="UPI">UPI / Digital App</option>
                              <option value="Bank">Direct Bank NEFT</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auto-Status</label>
                             <div className={`px-5 py-4 rounded-[24px] text-sm font-black text-center border-4 transition-all ${currentStatusAuto === 'Paid' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>{currentStatusAuto}</div>
                          </div>
                       </div>
                       
                       <div className="space-y-3 pt-4 border-t border-slate-200">
                         <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest">Amount Received (₹) *</label>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Updates Balance</span>
                         </div>
                         <div className="relative group">
                            <IndianRupee size={32} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
                            <input 
                                type="number" 
                                value={paidAmount} 
                                onChange={(e) => setPaidAmount(Number(e.target.value))} 
                                className="w-full pl-16 pr-8 py-6 border-4 border-white rounded-[32px] text-5xl font-black text-emerald-800 outline-none shadow-xl focus:ring-12 focus:ring-emerald-50 transition-all bg-emerald-50/20" 
                            />
                         </div>
                       </div>
                    </div>
                    <div className="space-y-3 px-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Office Billing Memo</label>
                      <textarea name="remarks" defaultValue={editingBill?.remarks} rows={3} className="w-full px-8 py-6 border-4 border-slate-50 rounded-[32px] outline-none focus:border-emerald-100 focus:bg-slate-50 transition-all text-sm font-medium" placeholder="Purpose, student details, etc..." />
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white p-12 rounded-[64px] flex flex-col justify-between shadow-2xl relative overflow-hidden group border-[12px] border-slate-800/50">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                       <FileText size={220} />
                    </div>
                    <div className="space-y-10 relative z-10">
                       <div className="flex justify-between items-center text-slate-400">
                          <span className="text-xs font-black uppercase tracking-[0.2em] flex items-center">
                             <Package size={18} className="mr-3 text-slate-500 transition-colors"/> Gross Cart Total
                          </span>
                          <span className="font-mono text-2xl">₹{totalBillRaw.toLocaleString()}</span>
                       </div>
                       
                       <div className="flex justify-between items-center text-rose-300">
                          <span className="flex items-center text-xs font-black uppercase tracking-[0.2em]">
                             <Tag size={20} className="mr-3 text-rose-400"/> Less: Discount (₹)
                          </span>
                          <div className="relative">
                             <input 
                                type="number" 
                                value={discount} 
                                onChange={(e) => setDiscount(Number(e.target.value))} 
                                className="w-36 bg-slate-800/80 border-2 border-slate-700 rounded-[20px] px-5 py-4 text-white font-black text-xl focus:ring-8 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all text-right shadow-inner" 
                             />
                          </div>
                       </div>

                       <div className="h-0.5 bg-slate-800 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]"></div>

                       <div className="space-y-3 py-6">
                          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] block text-center bg-emerald-400/10 py-1.5 rounded-full border border-emerald-400/20">Final Amount Payable</span>
                          <div className="flex flex-col items-center justify-center">
                             <span className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">₹{finalBillAmount.toLocaleString()}</span>
                          </div>
                       </div>

                       <div className="space-y-6 pt-10 border-t-2 border-slate-800/80">
                          <div className="flex justify-between items-center text-emerald-400/80">
                             <span className="text-xs font-black uppercase tracking-[0.1em]">Total Received</span>
                             <span className="font-black font-mono text-2xl">₹{Number(paidAmount).toLocaleString()}</span>
                          </div>
                          <div className={`flex justify-between items-center p-6 rounded-[32px] shadow-2xl transition-colors duration-500 ${currentBalanceDue > 0 ? 'bg-rose-600/20 text-rose-400 border-2 border-rose-500/20' : 'bg-emerald-600/20 text-emerald-400 border-2 border-emerald-500/20'}`}>
                             <span className="text-sm font-black uppercase tracking-[0.2em]">Balance Pending</span>
                             <span className="font-black font-mono text-4xl">₹{currentBalanceDue.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-12 flex justify-end space-x-6 sticky bottom-0 bg-white pb-8 z-10 border-t-2 border-slate-50">
                <button type="button" onClick={handleCloseModal} className="px-12 py-5 text-slate-500 font-black uppercase tracking-[0.2em] hover:bg-slate-100 rounded-[32px] transition-all border-2 border-transparent hover:border-slate-200 active:scale-95">Cancel</button>
                <button type="submit" className="px-20 py-5 bg-emerald-600 text-white font-black uppercase tracking-[0.2em] rounded-[32px] hover:bg-emerald-700 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] flex items-center space-x-4 active:scale-95 group">
                  <CheckCircle size={28} className="group-hover:rotate-12 transition-transform"/>
                  <span>{editingBill ? 'Apply Updates' : 'Generate & Save Bill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesBilling;
