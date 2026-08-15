import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, AlertTriangle, Boxes, Trash2, ArrowRight } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useAuth } from '../../hooks/useAuth';
import FormModal from '../../components/modals/FormModal';
import { FormField } from '../../components/forms/FormFields';
import Toast from '../../components/common/Toast';
import { staggerContainer, staggerItem, slideInBottom } from '../../utils/motionVariants';

export default function MaintenanceInventoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'OFFICE_ADMIN' || user?.roleKey === 'office-admin';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [toast, setToast] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: null, itemName: '', sku: '', description: '', category: '',
    currentQuantity: '0', minThreshold: '0', unit: 'pcs', supplier: ''
  });

  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      // Even if not admin, we try to fetch if backend allows it, but backend is blocked for non-admins now.
      // If we want read-only, we should adjust backend. The user spec says "Office Team: No inventory management access. Maintenance: No direct warehouse/inventory management access."
      // So only Admin can see this page effectively.
      const res = await inventoryService.getInventory();
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      if (err.message.includes('403') || err.message.includes('unauthorized')) {
         showToast('You do not have permission to access the warehouse', 'error');
      } else {
         showToast(err.message || 'Failed to load inventory', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.itemName.trim()) {
      showToast('Item Name is required', 'error');
      return;
    }

    try {
      const payload = {
        itemName: form.itemName.trim(),
        sku: form.sku.trim() || undefined,
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        currentQuantity: parseInt(form.currentQuantity) || 0,
        minThreshold: parseInt(form.minThreshold) || 0,
        unit: form.unit.trim() || 'pcs',
        supplier: form.supplier.trim() || undefined,
      };

      if (isEditing) {
        await inventoryService.updateItem(form.id, payload);
        showToast('✓ Item updated successfully');
      } else {
        await inventoryService.createItem(payload);
        showToast('✓ New inventory item created');
      }

      setModalOpen(false);
      loadInventory();
    } catch (err) {
      showToast(err.message || 'Failed to save item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this item?')) return;
    try {
      await inventoryService.deactivateItem(id);
      showToast('✓ Item deactivated');
      loadInventory();
    } catch (err) {
      showToast(err.message || 'Failed to deactivate item', 'error');
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(restockQuantity, 10);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid positive quantity', 'error');
      return;
    }
    
    try {
      await inventoryService.restockItem(selectedItem.id, qty, 'Manual restock from inventory page');
      showToast('✓ Item restocked successfully!');
      setRestockModalOpen(false);
      setRestockQuantity('');
      setSelectedItem(null);
      loadInventory();
    } catch (err) {
      showToast(err.message || 'Failed to restock item', 'error');
    }
  };

  const openNewModal = () => {
    setIsEditing(false);
    setForm({ id: null, itemName: '', sku: '', description: '', category: '', currentQuantity: '0', minThreshold: '0', unit: 'pcs', supplier: '' });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setForm({
      id: item.id,
      itemName: item.itemName || '',
      sku: item.sku || '',
      description: item.description || '',
      category: item.category || '',
      currentQuantity: String(item.currentQuantity),
      minThreshold: String(item.minThreshold),
      unit: item.unit || 'pcs',
      supplier: item.supplier || '',
    });
    setModalOpen(true);
  };

  const filteredItems = items.filter(item => 
    item.itemName.toLowerCase().includes(search.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(search.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isAdmin && !loading && items.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        You do not have administrative access to the Warehouse Inventory.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#00204a] tracking-tight leading-tight">
            Warehouse Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage materials, monitor stock levels, and quickly restock supplies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, SKU, or category..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] shadow-xs"
            />
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={openNewModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <Plus size={18} /> Add New Item
            </motion.button>
          )}
        </div>
      </div>

      {/* Inventory List */}
      <motion.div
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="text-center py-10 text-slate-500 text-sm">Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">No inventory items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-bold">Item Name</th>
                  <th className="pb-3 font-bold">SKU</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold text-right">Current Stock</th>
                  <th className="pb-3 font-bold text-center">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                          <Boxes size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.itemName}</p>
                          <p className="text-[10px] text-slate-500">{item.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs text-slate-600">{item.sku || '-'}</td>
                    <td className="py-4 text-slate-600">{item.category || '-'}</td>
                    <td className="py-4 text-right">
                      <span className="font-bold text-slate-900">{item.currentQuantity}</span> <span className="text-xs text-slate-500">{item.unit}</span>
                    </td>
                    <td className="py-4 text-center">
                      {item.stockStatus === 'LOW STOCK' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle size={10} /> LOW STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          NORMAL
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedItem(item); setRestockQuantity(''); setRestockModalOpen(true); }}
                            className="px-2 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                          >
                            Restock
                          </button>
                          <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Deactivate">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Item Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Inventory Item' : 'Create Inventory Item'}
        onSubmit={handleSave}
        submitLabel={isEditing ? 'Save Changes' : 'Create Item'}
      >
        <div className="space-y-4">
          <FormField label="Item Name *" name="itemName" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} placeholder="e.g. Copper Pipe 1/2 inch" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="SKU / Item Code" name="sku" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. PIP-COP-050" />
            <FormField label="Category" name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Plumbing" />
          </div>

          <FormField label="Description" name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Current Stock" name="currentQuantity" type="number" value={form.currentQuantity} onChange={e => setForm({ ...form, currentQuantity: e.target.value })} />
            <FormField label="Min Threshold" name="minThreshold" type="number" value={form.minThreshold} onChange={e => setForm({ ...form, minThreshold: e.target.value })} />
            <FormField label="Unit" name="unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="e.g. pcs, meters" />
          </div>
          
          <FormField label="Supplier" name="supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
        </div>
      </FormModal>

      {/* Restock Modal */}
      <FormModal
        isOpen={restockModalOpen}
        onClose={() => { setRestockModalOpen(false); setSelectedItem(null); }}
        title={`Restock: ${selectedItem?.itemName}`}
        onSubmit={handleRestockSubmit}
        submitLabel="Confirm Restock"
      >
        <div className="p-2 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-700">Current Quantity: <strong>{selectedItem?.currentQuantity} {selectedItem?.unit}</strong></p>
            <p className="text-xs text-slate-700">Minimum Threshold: <strong>{selectedItem?.minThreshold} {selectedItem?.unit}</strong></p>
          </div>
          <FormField
            label="Restock Quantity *"
            name="quantity"
            type="number"
            min="1"
            value={restockQuantity}
            onChange={e => setRestockQuantity(e.target.value)}
            placeholder="e.g. 50"
            autoFocus
          />
        </div>
      </FormModal>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
