
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Settings2, IndianRupee } from 'lucide-react';
import { Item, ItemType } from '../types';

const ItemManagement: React.FC<{ store: any }> = ({ store }) => {
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [search, setSearch] = useState('');

  // Local state for inline addition in Item Modal
  const [newCatName, setNewCatName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [isAddingCatInline, setIsAddingCatInline] = useState(false);
  const [isAddingUnitInline, setIsAddingUnitInline] = useState(false);

  const filteredItems = store.items.filter((it: Item) => 
    it.name.toLowerCase().includes(search.toLowerCase()) || 
    it.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name') as string,
      categoryId: formData.get('categoryId') as string,
      unitId: formData.get('unitId') as string,
      type: formData.get('type') as ItemType,
      defaultLocation: formData.get('defaultLocation') as string,
      minStockLevel: Number(formData.get('minStockLevel')),
      salePrice: Number(formData.get('salePrice')),
    };

    if (editingItem) {
      store.updateItem({ ...editingItem, ...itemData });
    } else {
      store.addItem(itemData);
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleInlineAddCat = () => {
    if (newCatName.trim()) {
      store.addCategory(newCatName);
      setNewCatName('');
      setIsAddingCatInline(false);
    }
  };

  const handleInlineAddUnit = () => {
    if (newUnitName.trim()) {
      store.addUnit(newUnitName);
      setNewUnitName('');
      setIsAddingUnitInline(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Item Master</h2>
          <p className="text-slate-500">Manage products, categories, and units</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => setShowCatModal(true)} className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 flex items-center space-x-2 transition-all">
             <Settings2 size={16} /> <span>Manage Categories</span>
           </button>
           <button onClick={() => setShowUnitModal(true)} className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 flex items-center space-x-2 transition-all">
             <Settings2 size={16} /> <span>Manage Units</span>
           </button>
           <button onClick={() => { setEditingItem(null); setShowItemModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-blue-500/20">
             <Plus size={18} /> <span>Add New Item</span>
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search SKU or name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Item Name</th>
                <th className="px-6 py-4 font-semibold text-emerald-600">Sale Price</th>
                <th className="px-6 py-4 font-semibold">Category/Unit</th>
                <th className="px-6 py-4 font-semibold">In Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((it: Item) => (
                <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-blue-600">{it.code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{it.name}</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">
                    ₹{it.salePrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{store.categories.find((c: any) => c.id === it.categoryId)?.name || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{store.units.find((u: any) => u.id === it.unitId)?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <span className={`text-sm font-bold ${it.currentStock <= it.minStockLevel ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{it.currentStock}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Min: {it.minStockLevel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => { setEditingItem(it); setShowItemModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => store.deleteItem(it.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No items matching your search</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingItem ? 'Edit Item Details' : 'Create New Inventory SKU'}</h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name *</label>
                 <input name="name" required defaultValue={editingItem?.name} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
               </div>
               
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                   Category *
                   <button type="button" onClick={() => setIsAddingCatInline(!isAddingCatInline)} className="text-blue-600 hover:underline">Add New</button>
                 </label>
                 {isAddingCatInline ? (
                   <div className="flex space-x-1">
                     <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Cat name..." className="flex-1 px-3 py-1.5 border border-blue-200 rounded-lg text-sm" />
                     <button type="button" onClick={handleInlineAddCat} className="bg-blue-600 text-white px-2 rounded-lg"><Plus size={16}/></button>
                   </div>
                 ) : (
                   <select name="categoryId" required defaultValue={editingItem?.categoryId} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                     <option value="">Select Category</option>
                     {store.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 )}
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                   Base Unit *
                   <button type="button" onClick={() => setIsAddingUnitInline(!isAddingUnitInline)} className="text-blue-600 hover:underline">Add New</button>
                 </label>
                 {isAddingUnitInline ? (
                   <div className="flex space-x-1">
                     <input value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} placeholder="Unit name..." className="flex-1 px-3 py-1.5 border border-blue-200 rounded-lg text-sm" />
                     <button type="button" onClick={handleInlineAddUnit} className="bg-blue-600 text-white px-2 rounded-lg"><Plus size={16}/></button>
                   </div>
                 ) : (
                   <select name="unitId" required defaultValue={editingItem?.unitId} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                     <option value="">Select Unit</option>
                     {store.units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                   </select>
                 )}
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Type *</label>
                 <select name="type" required defaultValue={editingItem?.type || 'Consumable'} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white outline-none">
                   <option value="Consumable">Consumable</option>
                   <option value="Asset">Asset</option>
                 </select>
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><IndianRupee size={12} className="mr-1"/> Default Sale Price (₹) *</label>
                 <input name="salePrice" type="number" step="0.01" required defaultValue={editingItem?.salePrice || 0} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-emerald-700" />
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min. Safety Stock Level *</label>
                 <input name="minStockLevel" type="number" required defaultValue={editingItem?.minStockLevel || 0} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" />
               </div>

               <div className="space-y-1 md:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Storage Location</label>
                 <input name="defaultLocation" defaultValue={editingItem?.defaultLocation} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" placeholder="e.g. Cabinet A, Room 101" />
               </div>

               <div className="md:col-span-2 pt-6 flex justify-end space-x-3 border-t border-slate-100 mt-4">
                 <button type="button" onClick={() => setShowItemModal(false)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                 <button type="submit" className="px-10 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30">
                   {editingItem ? 'Save Updates' : 'Create Item Entry'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Legacy Cat/Unit modals remain for dedicated management */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Manage Item Categories</h3>
              <button onClick={() => setShowCatModal(false)} className="hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <form onSubmit={(e: any) => {
                e.preventDefault();
                store.addCategory(e.target.catName.value);
                e.target.reset();
              }} className="flex space-x-2">
                <input name="catName" placeholder="New Category Name..." className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none" required />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-md">Add</button>
              </form>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-2">
                {store.categories.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm group">
                    <span className="font-semibold text-slate-700">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showUnitModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Manage Units of Measure</h3>
              <button onClick={() => setShowUnitModal(false)} className="hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <form onSubmit={(e: any) => {
                e.preventDefault();
                store.addUnit(e.target.unitName.value);
                e.target.reset();
              }} className="flex space-x-2">
                <input name="unitName" placeholder="New Unit (e.g. Roll, Box)..." className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none" required />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-md">Add</button>
              </form>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-2">
                {store.units.map((u: any) => (
                  <div key={u.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                    <span className="font-semibold text-slate-700">{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManagement;
