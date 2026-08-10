import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes, AlertTriangle, Plus, Search, Filter, RefreshCw, CheckCircle2,
  DollarSign, PackageCheck, Layers, ArrowUpRight, ShieldCheck, Edit2, Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import FormModal from '../../components/modals/FormModal';
import { FormField, SelectField } from '../../components/forms/FormFields';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

const TRADE_CATEGORIES = [
  'Plumbing & Leaks',
  'Electrical & Lighting',
  'HVAC & Air Con',
  'Carpentry & Locks',
  'Appliances & Repairs',
  'Painting & Drywall',
];

export default function MaintenanceInventoryPage() {
  const { user } = useAuth();

  // Robust Admin check (Office Admin, Super Admin, etc.)
  const isAdmin =
    user?.roleKey === 'office-admin' ||
    user?.roleKey === 'super-admin' ||
    (user?.role && user.role.toLowerCase().includes('admin')) ||
    !user;

  const [inventory, setInventory] = useState(maintenanceService.getInventory());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Add / Edit Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category: 'Plumbing & Leaks',
    stock: 20,
    minStock: 5,
    unitCost: 15.0,
    unit: 'pcs',
    location: 'Central Storage - Aisle 1',
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      sku: `SKU-INV-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Plumbing & Leaks',
      stock: 25,
      minStock: 5,
      unitCost: 18.5,
      unit: 'pcs',
      location: 'Central Storage - Aisle 2',
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      sku: item.sku,
      name: item.name,
      category: item.category,
      stock: item.stock,
      minStock: item.minStock,
      unitCost: item.unitCost,
      unit: item.unit || 'pcs',
      location: item.location || 'Central Storage',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter a part name.');
      return;
    }

    if (editingItem) {
      const updated = inventory.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              sku: form.sku,
              name: form.name,
              category: form.category,
              stock: parseInt(form.stock) || 0,
              minStock: parseInt(form.minStock) || 5,
              unitCost: parseFloat(form.unitCost) || 10,
              unit: form.unit,
              location: form.location,
            }
          : i
      );
      setInventory(updated);
      try {
        localStorage.setItem('ap_inventory_store_v2', JSON.stringify(updated));
      } catch {}
      alert(`✓ Inventory SKU "${form.name}" updated successfully!`);
    } else {
      const newItem = {
        id: `inv-${Date.now()}`,
        sku: form.sku,
        name: form.name,
        category: form.category,
        stock: parseInt(form.stock) || 0,
        minStock: parseInt(form.minStock) || 5,
        unitCost: parseFloat(form.unitCost) || 10,
        unit: form.unit,
        location: form.location,
        lastUsedBy: 'Admin Created',
      };
      const updated = [newItem, ...inventory];
      setInventory(updated);
      try {
        localStorage.setItem('ap_inventory_store_v2', JSON.stringify(updated));
      } catch {}
      alert(`✓ New SKU "${form.name}" added to Warehouse Store!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (itemId, itemName) => {
    if (!isAdmin) return;
    if (confirm(`Are you sure you want to remove SKU "${itemName}" from warehouse inventory?`)) {
      const updated = inventory.filter((i) => i.id !== itemId);
      setInventory(updated);
      try {
        localStorage.setItem('ap_inventory_store_v2', JSON.stringify(updated));
      } catch {}
      alert(`Removed ${itemName} from inventory store.`);
    }
  };

  const handleRestock = (itemId) => {
    if (!isAdmin) {
      alert('🔒 Restock permission is restricted to Office Admin only.');
      return;
    }
    const updated = inventory.map((i) => {
      if (i.id === itemId) {
        return { ...i, stock: i.stock + 10 };
      }
      return i;
    });
    setInventory(updated);
    try {
      localStorage.setItem('ap_inventory_store_v2', JSON.stringify(updated));
    } catch {}
    alert(`Restocked 10 units!`);
  };

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;
  const totalValuation = inventory.reduce((acc, i) => acc + i.stock * i.unitCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[#0e1526] border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Boxes size={22} className="text-purple-400 flex-shrink-0" /> <span>Inventory &amp; Spare Parts</span>
            </h1>
            {isAdmin ? (
              <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck size={12} /> Office Admin Stock Manager
              </span>
            ) : (
              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                <ShieldCheck size={12} /> Technician Read-Only Catalog
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Add, edit, restock, or remove warehouse inventory SKUs and track valuation'
              : 'View available spare parts catalog, stock levels, unit costs, and warehouse bin locations'}
          </p>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#009bf2] to-cyan-500 hover:brightness-110 shadow-[0_4px_14px_rgba(0,155,242,0.35)] transition-all cursor-pointer w-fit flex-shrink-0"
          >
            <Plus size={18} /> + Add Parts SKU
          </button>
        ) : (
          <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-white/5 flex-shrink-0">
            📦 Stock Status: Read-Only
          </span>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0e1526] border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Parts SKUs</p>
            <p className="text-2xl font-extrabold text-white mt-1">{inventory.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-[#0e1526] border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{lowStockCount} Items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-[#0e1526] border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Valuation</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">${totalValuation.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-[#0e1526] border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Warehouse</p>
            <p className="text-sm font-extrabold text-white mt-1">Central Facility A</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <PackageCheck size={20} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1526] border border-white/5 rounded-2xl p-3.5 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
          <Filter size={14} /> Category Filter:
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Trade Categories</option>
            {TRADE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ========= MOBILE CARD VIEW (visible below md) ========= */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#0e1526] border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No parts found matching your search.
          </div>
        ) : (
          filtered.map((item) => {
            const isLow = item.stock <= item.minStock;
            return (
              <div
                key={item.id}
                className={`bg-[#0e1526] border rounded-2xl p-4 shadow-lg space-y-3 ${
                  isLow ? 'border-amber-500/40' : 'border-slate-800/80'
                }`}
              >
                {/* Top: SKU + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono font-bold text-[#38bdf8] bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20 text-xs">
                    {item.sku}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex-shrink-0 ${
                      isLow
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    }`}
                  >
                    {isLow ? '⚠️ LOW STOCK' : '✓ Normal'}
                  </span>
                </div>

                {/* Part Name */}
                <div>
                  <p className="font-bold text-white text-sm leading-snug">{item.name}</p>
                  <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-block mt-1">
                    {item.category}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/60 rounded-xl p-2.5">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Stock</p>
                    <p className={`font-black ${ isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.stock} {item.unit}
                    </p>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-2.5">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Unit Cost</p>
                    <p className="font-black text-white">${item.unitCost.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-2.5 col-span-2">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">📍 Warehouse Bin</p>
                    <p className="font-semibold text-slate-300 text-[11px]">{item.location}</p>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-2.5 col-span-2">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">👤 Last Tech Log</p>
                    <p className="font-semibold text-slate-300 text-[11px]">{item.lastUsedBy || 'No recent log'}</p>
                  </div>
                </div>

                {/* Actions */}
                {isAdmin ? (
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleRestock(item.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-extrabold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      + Restock 10
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                      title="Edit SKU"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer border border-red-500/20"
                      title="Remove SKU"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* ========= DESKTOP TABLE VIEW (hidden below md) ========= */}
      <div className="hidden md:block bg-[#0e1526] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-[#111c35] via-[#1a294d] to-[#111c35] border-b-2 border-[#009bf2]/40 text-slate-100 font-black uppercase tracking-wider text-[11px] whitespace-nowrap shadow-md">
                <th className="py-4 px-5">
                  <span className="flex items-center gap-1.5 text-[#38bdf8]">🏷️ SKU Code</span>
                </th>
                <th className="py-4 px-5">
                  <span className="flex items-center gap-1.5 text-purple-300">📦 Part Name &amp; Category</span>
                </th>
                <th className="py-4 px-5">
                  <span className="flex items-center gap-1.5 text-emerald-300">📊 Available Stock</span>
                </th>
                <th className="py-4 px-5">
                  <span className="flex items-center gap-1.5 text-amber-300">💲 Unit Cost</span>
                </th>
                <th className="py-4 px-5">
                  <span className="flex items-center gap-1.5 text-blue-300">📍 Warehouse Bin</span>
                </th>
                <th className="py-4 px-5">
                  <span className="flex items-center gap-1.5 text-teal-300">👤 Last Tech Log</span>
                </th>
                <th className="py-4 px-5 text-right">
                  <span className="inline-flex items-center justify-end gap-1.5 text-pink-300">
                    ⚡ {isAdmin ? 'Admin Actions' : 'Stock Status'}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((item) => {
                const isLow = item.stock <= item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#38bdf8] bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                        {item.sku}
                      </span>
                    </td>
                    <td className="py-4 px-5 min-w-[200px]">
                      <p className="font-bold text-white text-xs leading-snug">{item.name}</p>
                      <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-block mt-1">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-xs px-2.5 py-1 rounded-lg border ${ isLow ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}` }>
                          {item.stock} {item.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse flex items-center gap-1">
                            <AlertTriangle size={11} /> LOW STOCK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap font-extrabold text-white">${item.unitCost.toFixed(2)}</td>
                    <td className="py-4 px-5 whitespace-nowrap text-slate-400 font-medium">📍 {item.location}</td>
                    <td className="py-4 px-5 whitespace-nowrap text-slate-300 font-medium">👤 {item.lastUsedBy || 'No recent log'}</td>
                    <td className="py-4 px-5 whitespace-nowrap text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" onClick={() => handleRestock(item.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer">+ Restock 10</button>
                          <button type="button" onClick={() => openEditModal(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Edit SKU"><Edit2 size={15} /></button>
                          <button type="button" onClick={() => handleDelete(item.id, item.name)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer" title="Remove SKU"><Trash2 size={15} /></button>
                        </div>
                      ) : (
                        <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl border inline-flex items-center gap-1 whitespace-nowrap ${ isLow ? 'text-amber-400 bg-amber-500/15 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'}`}>
                          {isLow ? '⚠️ Reorder Alert' : '✓ Stock Normal'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Add / Edit SKU Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Inventory SKU: ${editingItem.sku}` : 'Add New Warehouse Parts SKU'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="SKU Code"
              name="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
            <SelectField
              label="Trade Category"
              name="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={TRADE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <FormField
            label="Part / Spare Name *"
            name="name"
            placeholder="e.g. 3/4 Pipe Fitting, 20A Circuit Breaker"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField
              label="Stock Level *"
              name="stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
            <FormField
              label="Min Reorder Threshold"
              name="minStock"
              type="number"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            />
            <FormField
              label="Unit Cost ($) *"
              name="unitCost"
              type="number"
              step="0.01"
              value={form.unitCost}
              onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
              required
            />
          </div>

          <FormField
            label="Warehouse Location / Bin"
            name="location"
            placeholder="e.g. Central Storage - Aisle 3, Shelf B"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#009bf2] to-cyan-500 hover:brightness-110 shadow-md transition-all cursor-pointer"
            >
              {editingItem ? 'Save SKU Changes' : '+ Add SKU to Inventory'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
