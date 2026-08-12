import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Car, Layers, AlertCircle, UploadCloud } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import Button from '../../../shared/components/Button/Button';
import { showToastNotification } from '../../dashboard/dashboardSlice';

const DEMO_VEHICLES = [
  {
    id: 'demo_1',
    brand: 'BMW',
    modelName: 'iX Model',
    imageUrl: 'https://pngimg.com/uploads/bmw/bmw_PNG99525.png',
    type: 'SUV',
  },
  {
    id: 'demo_2',
    brand: 'BMW',
    modelName: 'iX1 Model',
    imageUrl: 'https://pngimg.com/uploads/bmw/bmw_PNG99546.png',
    type: 'SUV',
  },
  {
    id: 'demo_3',
    brand: 'Tesla',
    modelName: 'Model 3',
    imageUrl: 'https://pngimg.com/uploads/tesla_car/tesla_car_PNG11.png',
    type: 'Sedan',
  },
  {
    id: 'demo_4',
    brand: 'BYD',
    modelName: 'Han EV',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/BYD_Han_EV_front_20210328.png/640px-BYD_Han_EV_front_20210328.png',
    type: 'Sedan',
  }
];

const INITIAL_FORM = {
  brand: 'BMW',
  modelName: '',
  imageUrl: '',
  type: 'SUV'
};

export default function VehiclesPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ show: false, vehicleId: null });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch vehicles and brands list
  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setVehicles(DEMO_VEHICLES);
      setBrands([
        { name: 'Tesla' },
        { name: 'BMW' },
        { name: 'BYD' },
        { name: 'Volkswagen' }
      ]);
      setCategories([
        { name: 'SUV' },
        { name: 'Sedan' }
      ]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch vehicles from Live API
      const response = await api.get('/vehicles');
      if (response.data && response.data.success) {
        setVehicles(response.data.data || []);
      }
      
      // Fetch brand metadata dynamically from API
      const brandResponse = await api.get('/vehicles/brands');
      if (brandResponse.data && brandResponse.data.success) {
        setBrands(brandResponse.data.data || []);
      }

      // Fetch category metadata dynamically from API
      const categoryResponse = await api.get('/categories');
      if (categoryResponse.data && categoryResponse.data.success) {
        setCategories(categoryResponse.data.data || []);
      }
    } catch (err) {
      console.error(err);
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error syncing vehicles database.', 
        isError: true 
      }));
      // Fallback to demo items in case backend is loading/offline
      setVehicles(DEMO_VEHICLES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  // Open Modal for Create or Edit
  const openModal = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setSelectedVehicle(vehicle);
      setFormData({
        brand: vehicle.brand,
        modelName: vehicle.modelName,
        imageUrl: vehicle.imageUrl,
        type: vehicle.type
      });
      setImagePreview(vehicle.imageUrl || '');
      setImageFile(null);
    } else {
      setSelectedVehicle(null);
      setFormData({
        ...INITIAL_FORM,
        brand: brands.length > 0 ? brands[0].name : 'BMW',
        type: categories.length > 0 ? categories[0].name : 'SUV'
      });
      setImagePreview('');
      setImageFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    setFormData(INITIAL_FORM);
    setImageFile(null);
    setImagePreview('');
  };

  // Handles adding or editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.modelName.trim() || (!imageFile && !imagePreview)) {
      dispatch(showToastNotification({ message: 'Model name and vehicle image are required.', isError: true }));
      return;
    }

    setIsSubmitting(true);

    const submissionUrl = imageFile ? '' : imagePreview;

    if (isDemoMode) {
      const demoData = {
        ...formData,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : submissionUrl
      };
      if (selectedVehicle) {
        // Edit in demo
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, ...demoData } : v));
        dispatch(showToastNotification({ message: 'Vehicle updated successfully (Demo).', isError: false }));
      } else {
        // Add in demo
        const newV = {
          id: `demo_${Date.now()}`,
          ...demoData
        };
        setVehicles(prev => [newV, ...prev]);
        dispatch(showToastNotification({ message: 'Vehicle added successfully (Demo).', isError: false }));
      }
      closeModal();
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('brand', formData.brand);
      data.append('modelName', formData.modelName.trim());
      data.append('type', formData.type);
      if (imageFile) {
        data.append('image', imageFile);
      } else {
        data.append('imageUrl', submissionUrl);
      }

      if (selectedVehicle) {
        // Edit API call
        const response = await api.put(`/vehicles/${selectedVehicle.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data && response.data.success) {
          dispatch(showToastNotification({ message: 'Vehicle updated successfully.', isError: false }));
          loadData();
        }
      } else {
        // Create API call
        const response = await api.post('/vehicles', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data && response.data.success) {
          dispatch(showToastNotification({ message: 'Vehicle created successfully.', isError: false }));
          loadData();
        }
      }
      closeModal();
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error processing vehicle request.', 
        isError: true 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (id) => {
    setConfirmDeleteModal({ show: true, vehicleId: id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDeleteModal.vehicleId;
    if (!id) return;

    setIsSubmitting(true);

    if (isDemoMode) {
      setVehicles(prev => prev.filter(v => v.id !== id));
      dispatch(showToastNotification({ message: 'Vehicle deleted successfully (Demo).', isError: false }));
      setConfirmDeleteModal({ show: false, vehicleId: null });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.delete(`/vehicles/${id}`);
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Vehicle deleted successfully.', isError: false }));
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error deleting vehicle.', 
        isError: true 
      }));
    } finally {
      setConfirmDeleteModal({ show: false, vehicleId: null });
      setIsSubmitting(false);
    }
  };

  const suvCount = vehicles.filter(v => v.type?.toUpperCase() === 'SUV').length;
  const sedanCount = vehicles.filter(v => v.type?.toUpperCase() === 'SEDAN').length;

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Total Fleet Vehicles</span>
          <h3 className="text-2xl font-black text-appTextLight">{vehicles.length}</h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Total SUVs</span>
          <h3 className="text-2xl font-black text-appSecondary">{suvCount}</h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Total Sedans</span>
          <h3 className="text-2xl font-black text-emerald-400">{sedanCount}</h3>
        </div>
      </div>

      {/* 2. Vehicles Table Card */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-md font-bold">Fleet Management Registry</h2>
            <p className="text-xs text-appTextGray">View, add, modify, and delete connected vehicles available in user mobile app</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-appSecondary hover:bg-appSecondary/90 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/10"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {/* Vehicles List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-appTextGray uppercase tracking-wider bg-black/20">
                <th className="p-4 pl-6 w-1/4">Car model info</th>
                <th className="p-4 w-32">Brand</th>
                <th className="p-4 w-40">Vehicle Category</th>
                <th className="p-4 w-44 text-center">Car Image Preview</th>
                <th className="p-4 pr-6 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading && vehicles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-appTextGray">
                    Syncing fleet registry...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-appTextGray">
                    No vehicles found in fleet registry. Click "Add Vehicle" to register one.
                  </td>
                </tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v.id || v._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 truncate">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-appSecondary/10 border border-appSecondary/25 flex items-center justify-center font-bold text-appSecondary flex-shrink-0">
                          <Car className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-appTextLight truncate" title={v.modelName}>{v.modelName}</span>
                      </div>
                    </td>
                    <td className="p-4 truncate">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-appTextLight">
                        {v.brand}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-appTextGray truncate">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-appSecondary flex-shrink-0" />
                        {v.type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div 
                        className="rounded-lg overflow-hidden bg-black/40 border border-white/5 p-1 flex items-center justify-center mx-auto"
                        style={{ width: '80px', height: '40px', minWidth: '80px' }}
                      >
                        <img 
                          src={v.imageUrl} 
                          alt={v.modelName} 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=100";
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(v)}
                          className="p-2 text-appSecondary hover:bg-appSecondary/10 rounded-lg transition-all cursor-pointer border border-appSecondary/10"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => requestDelete(v.id || v._id)}
                          className="p-2 text-red-400 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer border border-red-500/10 hover:border-red-500/20"
                          title="Delete"
                        >
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

      {/* 3. Add / Edit Vehicle Modal Dialog */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={selectedVehicle ? 'Edit Fleet Vehicle' : 'Register New Fleet Vehicle'}
        icon={Car}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Brand Logo *</label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all cursor-pointer"
            >
              {brands.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Model Name *</label>
            <input
              type="text"
              placeholder="e.g. iX Model"
              value={formData.modelName}
              onChange={(e) => setFormData(prev => ({ ...prev, modelName: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
              required
            />
          </div>

          {/* Vehicle Image Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Vehicle Image *</label>
            
            {imagePreview ? (
              <div className="border border-white/10 bg-black rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-appCard border border-white/5 rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-appTextLight truncate">{imageFile ? imageFile.name : 'Current Image'}</p>
                    <p className="text-[10px] text-appTextGray font-semibold">
                      {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Vehicle Catalog Image'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 hover:border-red-500/50 text-red-400 text-xs font-bold rounded-lg transition-all"
                >
                  Change
                </button>
              </div>
            ) : (
              <label 
                htmlFor="vehicle-image-file"
                className="border-2 border-dashed border-white/10 hover:border-appSecondary/40 bg-black hover:bg-white/[0.01] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
              >
                <div className="w-10 h-10 rounded-full bg-appSecondary/10 border border-appSecondary/25 flex items-center justify-center text-appSecondary">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-appTextLight">Click to upload vehicle image</p>
                  <p className="text-[10px] text-appTextGray mt-0.5">Supports PNG, JPG, JPEG, WEBP or GIF (Max 5MB)</p>
                </div>
                <input 
                  type="file" 
                  id="vehicle-image-file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        dispatch(showToastNotification({ message: 'File is too large. Max size is 5MB.', isError: true }));
                        return;
                      }
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Vehicle Category Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Vehicle Category Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all cursor-pointer"
            >
              {categories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
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
              {isSubmitting ? 'Processing...' : selectedVehicle ? 'Apply Edits' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <ConfirmationModal
        show={confirmDeleteModal.show}
        onClose={() => setConfirmDeleteModal({ show: false, vehicleId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to permanently delete this fleet vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
