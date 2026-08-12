import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Zap, Eye, EyeOff, Upload, X, Check } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import Button from '../../../shared/components/Button/Button';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import { showToastNotification } from '../../dashboard/dashboardSlice';

// Icon presets with visual emoji previews
const ICON_PRESETS = [
  { key: 'bolt',     emoji: '⚡', label: 'Electric' },
  { key: 'calendar', emoji: '📅', label: 'Booking' },
  { key: 'build',    emoji: '🔧', label: 'Mechanical' },
  { key: 'tyre',     emoji: '🛞', label: 'Tire' },
  { key: 'tow',      emoji: '🚛', label: 'Tow Truck' },
  { key: 'battery',  emoji: '🔋', label: 'Battery' },
  { key: 'car',      emoji: '🚗', label: 'Vehicle' },
  { key: 'map',      emoji: '📍', label: 'Location' },
];

const getIconEmoji = (key) => ICON_PRESETS.find(i => i.key === key)?.emoji ?? '⚡';

const DEMO_SERVICES = [
  {
    _id: 'demo_srv_1',
    name: 'Instant Charge Boost',
    subtitle: 'Mobile charger to your location',
    icon: 'bolt',
    category: 'on_demand',
    isActive: true,
  },
  {
    _id: 'demo_srv_2',
    name: 'Full Charge Slot Booking',
    subtitle: 'Reserve a station & time',
    icon: 'calendar',
    category: 'on_demand',
    isActive: true,
  },
  {
    _id: 'demo_srv_3',
    name: 'Mechanical Issue',
    subtitle: 'On-site diagnostics & repair',
    icon: 'build',
    category: 'roadside',
    cost: 75,
    isActive: true,
  },
];

export default function ServicesPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    icon: 'bolt',
    category: 'on_demand',
    cost: 0,
    isActive: true,
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ show: false, service: null });

  // Fetch services
  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setServices(DEMO_SERVICES);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/services?isAdmin=true');
      if (response.data && response.data.success) {
        setServices(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error loading services registry.', 
        isError: true 
      }));
      setServices(DEMO_SERVICES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  // Open Modal for Create or Edit
  const openModal = (service = null) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        subtitle: service.subtitle || '',
        icon: service.icon || 'bolt',
        category: service.category || 'on_demand',
        cost: service.cost || 0,
        isActive: service.isActive !== false,
      });
      setIconPreview(service.iconUrl || null);
    } else {
      setSelectedService(null);
      setFormData({ name: '', subtitle: '', icon: 'bolt', category: 'on_demand', cost: 0, isActive: true });
      setIconPreview(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setFormData({ name: '', subtitle: '', icon: 'bolt', category: 'on_demand', cost: 0, isActive: true });
    setIconPreview(null);
  };

  // Icon file upload handler
  const handleIconFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      dispatch(showToastNotification({ message: 'Please select a valid image file.', isError: true }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setIconPreview(ev.target.result);
      setFormData(prev => ({ ...prev, icon: 'custom' }));
    };
    reader.readAsDataURL(file);
  };

  const clearCustomIcon = () => {
    setIconPreview(null);
    setFormData(prev => ({ ...prev, icon: 'bolt' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handles adding or editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subtitle.trim()) {
      dispatch(showToastNotification({ message: 'Name and subtitle are required.', isError: true }));
      return;
    }

    setIsSubmitting(true);

    if (isDemoMode) {
      if (selectedService) {
        setServices(prev => prev.map(s =>
          s._id === selectedService._id ? { ...s, ...formData, iconUrl: iconPreview } : s
        ));
        dispatch(showToastNotification({ message: 'Service updated (Demo).', isError: false }));
      } else {
        const newService = {
          _id: `demo_srv_${Date.now()}`,
          ...formData,
          iconUrl: iconPreview,
        };
        setServices(prev => [...prev, newService]);
        dispatch(showToastNotification({ message: 'Service created (Demo).', isError: false }));
      }
      closeModal();
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...formData };
      if (iconPreview) payload.iconUrl = iconPreview;
      if (selectedService) {
        const response = await api.put(`/services/${selectedService._id}`, payload);
        if (response.data?.success) {
          dispatch(showToastNotification({ message: 'Service updated successfully.', isError: false }));
          loadData();
        }
      } else {
        const response = await api.post('/services', payload);
        if (response.data?.success) {
          dispatch(showToastNotification({ message: 'Service created successfully.', isError: false }));
          loadData();
        }
      }
      closeModal();
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error processing service request.', 
        isError: true 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handles actual deletion on confirmation
  const handleConfirmDelete = async () => {
    const service = confirmDeleteModal.service;
    if (!service) return;

    setIsSubmitting(true);

    if (isDemoMode) {
      setServices(prev => prev.filter(s => s._id !== service._id));
      dispatch(showToastNotification({ message: 'Service deleted successfully (Demo).', isError: false }));
      setConfirmDeleteModal({ show: false, service: null });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.delete(`/services/${service._id}`);
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Service deleted successfully.', isError: false }));
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error deleting service.', 
        isError: true 
      }));
    } finally {
      setConfirmDeleteModal({ show: false, service: null });
      setIsSubmitting(false);
    }
  };

  const toggleServiceStatus = async (service) => {
    if (isDemoMode) {
      setServices(prev => prev.map(s => s._id === service._id ? { ...s, isActive: !s.isActive } : s));
      dispatch(showToastNotification({ message: 'Toggled service status (Demo).', isError: false }));
      return;
    }

    try {
      const response = await api.put(`/services/${service._id}`, { isActive: !service.isActive });
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Service status toggled successfully.', isError: false }));
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ message: 'Error toggling service status.', isError: true }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex justify-between items-center bg-appCard border border-white/5 p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Configure Platform Services</h2>
          <p className="text-xs text-appTextGray mt-1">Configure, toggle active states, or create roadside assistance and charging services.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-appSecondary hover:bg-appSecondary/95 text-black font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* 2. Services List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-appSecondary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section A: On Demand Charging */}
          <div className="bg-appCard border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-appSecondary tracking-wider uppercase">On-Demand Charging</h3>
            <div className="space-y-3">
              {services.filter(s => s.category === 'on_demand').map(service => (
                <div key={service._id} className="flex justify-between items-center p-4 bg-appBg/60 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-appSecondary/10 rounded-xl flex items-center justify-center border border-appSecondary/20 text-xl">
                      {service.iconUrl
                        ? <img src={service.iconUrl} alt="icon" className="w-6 h-6 object-contain rounded" />
                        : getIconEmoji(service.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-appTextLight">{service.name}</h4>
                      <p className="text-[11px] text-appTextGray mt-0.5">{service.subtitle} • AED {service.cost || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleServiceStatus(service)} className="p-2 hover:bg-white/5 rounded-lg transition-all cursor-pointer" title={service.isActive ? 'Deactivate' : 'Activate'}>
                      {service.isActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                    </button>
                    <button onClick={() => openModal(service)} className="p-2 hover:bg-white/5 rounded-lg text-appTextGray hover:text-appTextLight transition-all cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDeleteModal({ show: true, service })} className="p-2 hover:bg-red-950/20 rounded-lg text-red-400 transition-all cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {services.filter(s => s.category === 'on_demand').length === 0 && (
                <p className="text-xs text-appTextGray text-center py-6">No on-demand services registered.</p>
              )}
            </div>
          </div>

          {/* Section B: Roadside Assistance */}
          <div className="bg-appCard border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-appSecondary tracking-wider uppercase">Roadside Assistance</h3>
            <div className="space-y-3">
              {services.filter(s => s.category === 'roadside').map(service => (
                <div key={service._id} className="flex justify-between items-center p-4 bg-appBg/60 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-appSecondary/10 rounded-xl flex items-center justify-center border border-appSecondary/20 text-xl">
                      {service.iconUrl
                        ? <img src={service.iconUrl} alt="icon" className="w-6 h-6 object-contain rounded" />
                        : getIconEmoji(service.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-appTextLight">{service.name}</h4>
                      <p className="text-[11px] text-appTextGray mt-0.5">{service.subtitle} • AED {service.cost || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleServiceStatus(service)} className="p-2 hover:bg-white/5 rounded-lg transition-all cursor-pointer" title={service.isActive ? 'Deactivate' : 'Activate'}>
                      {service.isActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                    </button>
                    <button onClick={() => openModal(service)} className="p-2 hover:bg-white/5 rounded-lg text-appTextGray hover:text-appTextLight transition-all cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDeleteModal({ show: true, service })} className="p-2 hover:bg-red-950/20 rounded-lg text-red-400 transition-all cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {services.filter(s => s.category === 'roadside').length === 0 && (
                <p className="text-xs text-appTextGray text-center py-6">No roadside services registered.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Add/Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={selectedService ? 'Update Service Definition' : 'Register New Platform Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Service Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight placeholder-white/20 focus:outline-none focus:border-appSecondary transition-all"
              placeholder="e.g. Mechanical Assistance"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Subtitle Description *</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight placeholder-white/20 focus:outline-none focus:border-appSecondary transition-all"
              placeholder="e.g. Flat tire repair or vehicle towing"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all appearance-none cursor-pointer"
            >
              <option value="on_demand" className="bg-appBg text-appTextLight">⚡ On-Demand Charging</option>
              <option value="roadside" className="bg-appBg text-appTextLight">🛠️ Roadside Assistance</option>
            </select>
          </div>

          {/* Service Cost */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Service Cost (AED) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight placeholder-white/20 focus:outline-none focus:border-appSecondary transition-all"
              placeholder="0.00"
              required
            />
          </div>

          {/* Icon / Image Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Service Icon *</label>

            {/* Upload Area */}
            {iconPreview ? (
              <div className="border border-white/10 bg-black rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-appCard border border-white/5 rounded-lg flex items-center justify-center p-2">
                    <img src={iconPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-appTextLight">Custom icon uploaded</p>
                    <p className="text-[10px] text-appTextGray mt-0.5">Will be used as service icon</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearCustomIcon}
                  className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 hover:border-red-500/50 text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <label
                htmlFor="service-icon-file"
                className="border-2 border-dashed border-white/10 hover:border-appSecondary/40 bg-black hover:bg-white/[0.01] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
              >
                <div className="w-10 h-10 rounded-full bg-appSecondary/10 border border-appSecondary/25 flex items-center justify-center text-appSecondary">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-appTextLight">Click to upload service icon</p>
                  <p className="text-[10px] text-appTextGray mt-0.5">Supports PNG, JPG, SVG or WEBP (Max 2MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="service-icon-file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconFileChange}
                />
              </label>
            )}


          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="accent-appSecondary w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-appTextLight cursor-pointer">
              Activate service immediately on platform registry
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 bg-appCard hover:bg-white/5 border border-white/10 text-appTextLight text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-appSecondary hover:bg-appSecondary/90 disabled:opacity-60 text-black text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/20"
            >
              {isSubmitting ? 'Saving...' : selectedService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Delete Confirmation */}
      <ConfirmationModal
        show={confirmDeleteModal.show}
        onClose={() => setConfirmDeleteModal({ show: false, service: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Service Definition?"
        message={`Are you sure you want to delete '${confirmDeleteModal.service?.name}'? This will remove it from the platform registry.`}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
