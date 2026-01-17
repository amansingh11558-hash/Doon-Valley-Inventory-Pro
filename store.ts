
import { useState, useEffect } from 'react';
import { Vendor, Category, Unit, Item, PurchaseBill, SalesBill, AuditLog } from './types';

const STORAGE_KEY = 'dvhs_inventory_v1';

export const useInventoryStore = () => {
  const [data, setData] = useState<{
    vendors: Vendor[];
    categories: Category[];
    units: Unit[];
    items: Item[];
    purchaseBills: PurchaseBill[];
    salesBills: SalesBill[];
    logs: AuditLog[];
  }>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      vendors: [],
      categories: [
        { id: '1', name: 'Stationery' },
        { id: '2', name: 'Electronics' },
        { id: '3', name: 'Furniture' },
        { id: '4', name: 'Lab Equipment' }
      ],
      units: [
        { id: '1', name: 'Pcs' },
        { id: '2', name: 'Kg' },
        { id: '3', name: 'Box' },
        { id: '4', name: 'Set' }
      ],
      items: [],
      purchaseBills: [],
      salesBills: [],
      logs: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addLog = (action: AuditLog['action'], module: string, details: string) => {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user: 'Admin',
      action,
      module,
      details
    };
    setData(prev => ({ ...prev, logs: [log, ...prev.logs].slice(0, 100) }));
  };

  const addVendor = (v: Omit<Vendor, 'id' | 'code'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const code = `VND-${String(data.vendors.length + 1).padStart(4, '0')}`;
    const newVendor = { ...v, id, code };
    setData(prev => ({ ...prev, vendors: [...prev.vendors, newVendor] }));
    addLog('CREATE', 'Vendor', `Added vendor ${v.name}`);
  };

  const updateVendor = (v: Vendor) => {
    setData(prev => ({
      ...prev,
      vendors: prev.vendors.map(item => item.id === v.id ? v : item)
    }));
    addLog('EDIT', 'Vendor', `Updated vendor ${v.name}`);
  };

  const deleteVendor = (id: string) => {
    if (data.purchaseBills.some(b => b.vendorId === id)) {
      alert("Cannot delete vendor with linked transactions.");
      return;
    }
    const v = data.vendors.find(x => x.id === id);
    setData(prev => ({ ...prev, vendors: prev.vendors.filter(x => x.id !== id) }));
    addLog('DELETE', 'Vendor', `Deleted vendor ${v?.name}`);
  };

  const addItem = (it: Omit<Item, 'id' | 'code' | 'currentStock'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const code = `ITM-${String(data.items.length + 1).padStart(4, '0')}`;
    const newItem: Item = { ...it, id, code, currentStock: 0 };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    addLog('CREATE', 'Item', `Added item ${it.name}`);
  };

  const updateItem = (it: Item) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(x => x.id === it.id ? it : x)
    }));
    addLog('EDIT', 'Item', `Updated item ${it.name}`);
  };

  const deleteItem = (id: string) => {
    if (data.purchaseBills.some(b => b.items.some(i => i.itemId === id)) || 
        data.salesBills.some(b => b.items.some(i => i.itemId === id))) {
      alert("Cannot delete item with existing stock transactions.");
      return;
    }
    const it = data.items.find(x => x.id === id);
    setData(prev => ({ ...prev, items: prev.items.filter(x => x.id !== id) }));
    addLog('DELETE', 'Item', `Deleted item ${it?.name}`);
  };

  const createPurchase = (pb: Omit<PurchaseBill, 'id' | 'invoiceNo' | 'totalAmount' | 'balanceAmount'> & { itemSalePrices?: Record<string, number> }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const year = new Date().getFullYear();
    const count = String(data.purchaseBills.length + 1).padStart(4, '0');
    const invoiceNo = `DVHS-PUR-${year}-${count}`;
    const totalAmount = pb.items.reduce((sum, item) => sum + item.total, 0);
    const balanceAmount = totalAmount - pb.paidAmount;
    
    const newBill: PurchaseBill = { ...pb, id, invoiceNo, totalAmount, balanceAmount };
    
    const updatedItems = data.items.map(item => {
      const billItem = pb.items.find(bi => bi.itemId === item.id);
      if (billItem) {
        const newSalePrice = pb.itemSalePrices?.[item.id] ?? item.salePrice;
        return { ...item, currentStock: item.currentStock + billItem.quantity, salePrice: newSalePrice };
      }
      return item;
    });

    setData(prev => ({ ...prev, items: updatedItems, purchaseBills: [...prev.purchaseBills, newBill] }));
    addLog('CREATE', 'Purchase', `Created bill ${invoiceNo}`);
  };

  const updatePurchase = (pb: PurchaseBill & { itemSalePrices?: Record<string, number> }) => {
    const oldBill = data.purchaseBills.find(b => b.id === pb.id);
    if (!oldBill) return;

    let intermediateItems = data.items.map(item => {
      const oldBillItem = oldBill.items.find(bi => bi.itemId === item.id);
      if (oldBillItem) {
        return { ...item, currentStock: item.currentStock - oldBillItem.quantity };
      }
      return item;
    });

    const finalTotalAmount = pb.items.reduce((sum, item) => sum + item.total, 0);
    const finalBalanceAmount = finalTotalAmount - pb.paidAmount;
    const updatedBill = { ...pb, totalAmount: finalTotalAmount, balanceAmount: finalBalanceAmount };

    const finalItems = intermediateItems.map(item => {
      const newBillItem = pb.items.find(bi => bi.itemId === item.id);
      if (newBillItem) {
        const newSalePrice = pb.itemSalePrices?.[item.id] ?? item.salePrice;
        return { ...item, currentStock: item.currentStock + newBillItem.quantity, salePrice: newSalePrice };
      }
      return item;
    });

    setData(prev => ({
      ...prev,
      items: finalItems,
      purchaseBills: prev.purchaseBills.map(b => b.id === pb.id ? updatedBill : b)
    }));
    addLog('EDIT', 'Purchase', `Updated bill ${pb.invoiceNo}`);
  };

  const deletePurchase = (id: string) => {
    const bill = data.purchaseBills.find(b => b.id === id);
    if (!bill) return;

    const updatedItems = data.items.map(item => {
      const billItem = bill.items.find(bi => bi.itemId === item.id);
      if (billItem) {
        return { ...item, currentStock: item.currentStock - billItem.quantity };
      }
      return item;
    });

    setData(prev => ({
      ...prev,
      items: updatedItems,
      purchaseBills: prev.purchaseBills.filter(b => b.id !== id)
    }));
    addLog('DELETE', 'Purchase', `Deleted bill ${bill.invoiceNo}`);
  };

  const createSales = (sb: Omit<SalesBill, 'id' | 'invoiceNo'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const year = new Date().getFullYear();
    const count = String(data.salesBills.length + 1).padStart(4, '0');
    const invoiceNo = `DVHS-SAL-${year}-${count}`;
    
    // Ensure balanceAmount is explicitly included
    const balanceAmount = sb.finalAmount - sb.paidAmount;
    const newBill: SalesBill = { ...sb, id, invoiceNo, balanceAmount };

    const updatedItems = data.items.map(item => {
      const billItem = sb.items.find(bi => bi.itemId === item.id);
      if (billItem) {
        return { ...item, currentStock: item.currentStock - billItem.quantity };
      }
      return item;
    });

    setData(prev => ({ ...prev, items: updatedItems, salesBills: [...prev.salesBills, newBill] }));
    addLog('CREATE', 'Sales', `Issued bill ${invoiceNo}`);
  };

  const updateSales = (sb: SalesBill) => {
    const oldBill = data.salesBills.find(b => b.id === sb.id);
    if (!oldBill) return;

    let intermediateItems = data.items.map(item => {
      const oldBillItem = oldBill.items.find(bi => bi.itemId === item.id);
      if (oldBillItem) {
        return { ...item, currentStock: item.currentStock + oldBillItem.quantity };
      }
      return item;
    });

    const finalItems = intermediateItems.map(item => {
      const newBillItem = sb.items.find(bi => bi.itemId === item.id);
      if (newBillItem) {
        return { ...item, currentStock: item.currentStock - newBillItem.quantity };
      }
      return item;
    });

    // Ensure balanceAmount is explicitly updated
    const updatedBill = { ...sb, balanceAmount: sb.finalAmount - sb.paidAmount };

    setData(prev => ({
      ...prev,
      items: finalItems,
      salesBills: prev.salesBills.map(b => b.id === sb.id ? updatedBill : b)
    }));
    addLog('EDIT', 'Sales', `Updated bill ${sb.invoiceNo}`);
  };

  const deleteSales = (id: string) => {
    const bill = data.salesBills.find(b => b.id === id);
    if (!bill) return;

    const updatedItems = data.items.map(item => {
      const billItem = bill.items.find(bi => bi.itemId === item.id);
      if (billItem) {
        return { ...item, currentStock: item.currentStock + billItem.quantity };
      }
      return item;
    });

    setData(prev => ({
      ...prev,
      items: updatedItems,
      salesBills: prev.salesBills.filter(b => b.id !== id)
    }));
    addLog('DELETE', 'Sales', `Deleted bill ${bill.invoiceNo}`);
  };

  const addCategory = (name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setData(prev => ({ ...prev, categories: [...prev.categories, { id, name }] }));
    addLog('CREATE', 'Category', `Added category ${name}`);
    return id;
  };

  const addUnit = (name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setData(prev => ({ ...prev, units: [...prev.units, { id, name }] }));
    addLog('CREATE', 'Unit', `Added unit ${name}`);
    return id;
  };

  return {
    ...data,
    addVendor,
    updateVendor,
    deleteVendor,
    addItem,
    updateItem,
    deleteItem,
    createPurchase,
    updatePurchase,
    deletePurchase,
    createSales,
    updateSales,
    deleteSales,
    addCategory,
    addUnit
  };
};
