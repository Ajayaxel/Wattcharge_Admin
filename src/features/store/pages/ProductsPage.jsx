import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Box, AlertCircle } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import Button from '../../../shared/components/Button/Button';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import { showToastNotification } from '../../dashboard/dashboardSlice';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const initialForm = {
    name: '', displayName: '', description: '', fullDescription: '',
    price: 0, category: '', stock: 0, icon: 'power_rounded', imageUrl: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ show: false, product: null });
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }

    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?search=${searchQuery}&isAdmin=true`),
        api.get('/product-categories')
      ]);
      
      if (prodRes.data?.success) setProducts(prodRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
    } catch (err) {
      dispatch(showToastNotification({ message: 'Failed to load store data.', isError: true }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode, searchQuery]);

  const openModal = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        displayName: product.displayName,
        description: product.description,
        fullDescription: product.fullDescription,
        price: product.price,
        category: product.category?.name || product.category || '',
        stock: product.stock,
        icon: product.icon || 'power_rounded',
        imageUrl: product.imageUrl || ''
      });
    } else {
      setSelectedProduct(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price === '' || !formData.category) {
      dispatch(showToastNotification({ message: 'Name, price, and category are required.', isError: true }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, formData);
        dispatch(showToastNotification({ message: 'Product updated successfully.', isError: false }));
      } else {
        await api.post('/products', formData);
        dispatch(showToastNotification({ message: 'Product created successfully.', isError: false }));
      }
      closeModal();
      loadData();
    } catch (err) {
      dispatch(showToastNotification({ message: err.response?.data?.message || 'Error saving product', isError: true }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteModal.product) return;
    try {
      await api.delete(`/products/${confirmDeleteModal.product._id}`);
      dispatch(showToastNotification({ message: 'Product deleted successfully.', isError: false }));
      loadData();
    } catch (err) {
      dispatch(showToastNotification({ message: 'Failed to delete product.', isError: true }));
    } finally {
      setConfirmDeleteModal({ show: false, product: null });
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) < 5).length;

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Total Products</span>
          <h3 className="text-2xl font-black text-appTextLight">{totalProducts}</h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Total Stock Units</span>
          <h3 className="text-2xl font-black text-appSecondary">{totalStock}</h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Low Stock Alerts</span>
          <h3 className="text-2xl font-black text-red-400">{lowStockProducts}</h3>
        </div>
      </div>

      {/* Products Table Registry */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-md font-bold">Store Products Registry</h2>
            <p className="text-xs text-appTextGray">Manage EV gear and accessories</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter products..."
              className="px-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-appTextLight focus:outline-none focus:border-appSecondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-appSecondary hover:bg-appSecondary/90 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/10 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-appTextGray uppercase tracking-wider bg-black/20">
                <th className="p-4 pl-6 w-1/3">Product</th>
                <th className="p-4 w-1/5">Category</th>
                <th className="p-4 w-32 text-right">Price</th>
                <th className="p-4 w-32 text-center">Stock</th>
                <th className="p-4 pr-6 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-appTextGray">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-appSecondary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-appTextGray">
                    No products found in the store.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-appSecondary/10 border border-appSecondary/25 flex items-center justify-center flex-shrink-0">
                          <Box className="text-appSecondary w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-appTextLight truncate">{product.displayName}</div>
                          <div className="text-[10px] font-medium text-appTextGray truncate mt-0.5">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-appSecondary/10 text-appSecondary border border-appSecondary/20">
                        {product.category?.name || 'No Category'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-appTextLight">AED {product.price}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`font-bold ${product.stock < 5 ? 'text-red-400' : 'text-appTextLight'}`}>
                        {product.stock} units
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(product)} className="p-2 text-appSecondary hover:bg-appSecondary/10 rounded-lg transition-all cursor-pointer border border-appSecondary/10" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDeleteModal({ show: true, product })} className="p-2 text-red-400 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer border border-red-500/10 hover:border-red-500/20" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onClose={closeModal} title={selectedProduct ? 'Edit Product' : 'Add Product'} icon={Box}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-appTextGray block">Search Name *</label>
              <input required type="text" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-appTextGray block">Display Name *</label>
              <input required type="text" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-appTextGray block">Price (AED) *</label>
              <input required type="number" min="0" step="0.01" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-appTextGray block">Stock *</label>
              <input required type="number" min="0" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Category *</label>
            <input required list="category-options" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Type a new category or select one" />
            <datalist id="category-options">
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Short Description *</label>
            <input required type="text" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Full Description *</label>
            <textarea required rows={3} className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all resize-none" value={formData.fullDescription} onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Image URL (Optional)</label>
            <input type="text" placeholder="Leaves empty to use default icon" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : selectedProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        show={confirmDeleteModal.show}
        onClose={() => setConfirmDeleteModal({ show: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${confirmDeleteModal.product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
