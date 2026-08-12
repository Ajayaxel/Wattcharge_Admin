import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Layers, AlertCircle } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import Button from '../../../shared/components/Button/Button';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import { showToastNotification } from '../../dashboard/dashboardSlice';

const DEMO_CATEGORIES = [
  {
    id: 'demo_cat_1',
    name: 'SUV',
    description: 'Sports Utility Vehicle - suitable for rough terrain and families.',
  },
  {
    id: 'demo_cat_2',
    name: 'Sedan',
    description: 'Standard 4-door passenger car - efficient and comfortable.',
  },
];

const DEMO_VEHICLES = [
  { type: 'SUV' },
  { type: 'SUV' },
  { type: 'Sedan' },
  { type: 'Sedan' },
];

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ show: false, category: null });

  // Fetch categories and vehicles
  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setCategories(DEMO_CATEGORIES);
      setVehicles(DEMO_VEHICLES);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch categories from live API
      const catResponse = await api.get('/categories');
      if (catResponse.data && catResponse.data.success) {
        setCategories(catResponse.data.data || []);
      }

      // Fetch vehicles from live API
      const vehicleResponse = await api.get('/vehicles');
      if (vehicleResponse.data && vehicleResponse.data.success) {
        setVehicles(vehicleResponse.data.data || []);
      }
    } catch (err) {
      console.error(err);
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error loading category registry.', 
        isError: true 
      }));
      setCategories(DEMO_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  // Open Modal for Create or Edit
  const openModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setSelectedCategory(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
  };

  // Handles adding or editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      dispatch(showToastNotification({ message: 'Category name is required.', isError: true }));
      return;
    }

    setIsSubmitting(true);

    if (isDemoMode) {
      if (selectedCategory) {
        // Edit in demo
        setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, ...formData } : c));
        dispatch(showToastNotification({ message: 'Category updated successfully (Demo).', isError: false }));
      } else {
        // Add in demo
        const newCat = {
          id: `demo_cat_${Date.now()}`,
          name: formData.name.trim(),
          description: formData.description.trim(),
        };
        setCategories(prev => [...prev, newCat]);
        dispatch(showToastNotification({ message: 'Category created successfully (Demo).', isError: false }));
      }
      closeModal();
      setIsSubmitting(false);
      return;
    }

    try {
      if (selectedCategory) {
        // Edit API call
        const response = await api.put(`/categories/${selectedCategory.id}`, formData);
        if (response.data && response.data.success) {
          dispatch(showToastNotification({ message: 'Category updated successfully.', isError: false }));
          loadData();
        }
      } else {
        // Create API call
        const response = await api.post('/categories', formData);
        if (response.data && response.data.success) {
          dispatch(showToastNotification({ message: 'Category created successfully.', isError: false }));
          loadData();
        }
      }
      closeModal();
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error processing category request.', 
        isError: true 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Triggers deletion verification popup
  const requestDelete = (category) => {
    const hasVehicles = vehicles.some(v => v.type?.toLowerCase() === category.name?.toLowerCase());
    if (hasVehicles) {
      dispatch(showToastNotification({ 
        message: `Cannot delete category '${category.name}'. It is currently assigned to registered fleet vehicles.`, 
        isError: true 
      }));
      return;
    }
    setConfirmDeleteModal({ show: true, category });
  };

  // Handles actual deletion on confirmation
  const handleConfirmDelete = async () => {
    const category = confirmDeleteModal.category;
    if (!category) return;

    setIsSubmitting(true);

    if (isDemoMode) {
      setCategories(prev => prev.filter(c => c.id !== category.id));
      dispatch(showToastNotification({ message: 'Category deleted successfully (Demo).', isError: false }));
      setConfirmDeleteModal({ show: false, category: null });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.delete(`/categories/${category.id}`);
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Category deleted successfully.', isError: false }));
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error deleting category.', 
        isError: true 
      }));
    } finally {
      setConfirmDeleteModal({ show: false, category: null });
      setIsSubmitting(false);
    }
  };

  const totalCategoriesCount = categories.length;
  const activeCategoriesCount = categories.filter(c => 
    vehicles.some(v => v.type?.toLowerCase() === c.name?.toLowerCase())
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Total Registered Categories</span>
          <h3 className="text-2xl font-black text-appTextLight">{totalCategoriesCount}</h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Active Fleet Categories</span>
          <h3 className="text-2xl font-black text-appSecondary">{activeCategoriesCount} <span className="text-xs font-semibold text-appTextGray">/ {totalCategoriesCount} active</span></h3>
        </div>
      </div>

      {/* 2. Categories Table Registry */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-md font-bold">Vehicle Categories Registry</h2>
            <p className="text-xs text-appTextGray">View, add, modify, and delete vehicle category definitions available in user mobile app</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-appSecondary hover:bg-appSecondary/90 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/10"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Categories List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-appTextGray uppercase tracking-wider bg-black/20">
                <th className="p-4 pl-6 w-1/4">Category Type</th>
                <th className="p-4 w-2/5">Description</th>
                <th className="p-4 w-32 text-center">Vehicles Registered</th>
                <th className="p-4 pr-6 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading && categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-appTextGray">
                    Syncing categories registry...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-appTextGray">
                    No categories registered. Click "Add Category" to setup one.
                  </td>
                </tr>
              ) : (
                categories.map(c => {
                  const count = vehicles.filter(v => v.type?.toLowerCase() === c.name?.toLowerCase()).length;
                  return (
                    <tr key={c.id || c._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 truncate">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-appSecondary/10 border border-appSecondary/25 flex items-center justify-center font-bold text-appSecondary flex-shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-appTextLight truncate" title={c.name}>{c.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-appTextGray truncate" title={c.description}>
                        {c.description || <span className="italic opacity-40">No description provided</span>}
                      </td>
                      <td className="p-4 text-center font-bold text-appTextLight">
                        {count}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(c)}
                            className="p-2 text-appSecondary hover:bg-appSecondary/10 rounded-lg transition-all cursor-pointer border border-appSecondary/10"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => requestDelete(c)}
                            className="p-2 text-red-400 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer border border-red-500/10 hover:border-red-500/20"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Add / Edit Category Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={selectedCategory ? 'Edit Vehicle Category' : 'Register Vehicle Category'}
        icon={Layers}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. SUV, Sedan, Hatchback, Truck"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
              required
            />
          </div>

          {/* Category Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Description (Optional)</label>
            <textarea
              placeholder="Provide a brief description of vehicles matching this category..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : selectedCategory ? 'Apply Edits' : 'Register Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <ConfirmationModal
        show={confirmDeleteModal.show}
        onClose={() => setConfirmDeleteModal({ show: false, category: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle Category"
        message={`Are you sure you want to permanently delete category "${confirmDeleteModal.category?.name}" from the system registry? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
