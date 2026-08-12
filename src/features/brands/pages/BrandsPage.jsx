import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Tags, Image as ImageIcon, AlertCircle, UploadCloud, Check } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import Button from '../../../shared/components/Button/Button';
import { showToastNotification } from '../../dashboard/dashboardSlice';

const DEMO_BRANDS = [
  {
    id: 'demo_brand_1',
    name: 'Tesla',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.svg/1200px-Tesla_logo.svg.png',
  },
  {
    id: 'demo_brand_2',
    name: 'BMW',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png',
  },
  {
    id: 'demo_brand_3',
    name: 'BYD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/BYD_logo.svg/1200px-BYD_logo.svg.png',
  },
  {
    id: 'demo_brand_4',
    name: 'Volkswagen',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1200px-Volkswagen_logo_2019.svg.png',
  },
];

const DEMO_VEHICLES = [
  { brand: 'BMW' },
  { brand: 'BMW' },
  { brand: 'Tesla' },
  { brand: 'BYD' }
];

export default function BrandsPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [brands, setBrands] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, brand: null });

  // Fetch brands and vehicles list to calculate active stats
  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setBrands(DEMO_BRANDS);
      setVehicles(DEMO_VEHICLES);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch brands from database
      const brandResponse = await api.get('/brands');
      if (brandResponse.data && brandResponse.data.success) {
        setBrands(brandResponse.data.data || []);
      }

      // Fetch vehicles from database
      const vehicleResponse = await api.get('/vehicles');
      if (vehicleResponse.data && vehicleResponse.data.success) {
        setVehicles(vehicleResponse.data.data || []);
      }
    } catch (err) {
      console.error(err);
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error loading brand registry.', 
        isError: true 
      }));
      setBrands(DEMO_BRANDS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  // Handle Logo file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        dispatch(showToastNotification({ message: 'File is too large. Max size is 5MB.', isError: true }));
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = () => {
    setBrandName('');
    setLogoFile(null);
    setLogoPreview('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setBrandName('');
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) {
      dispatch(showToastNotification({ message: 'Brand name is required.', isError: true }));
      return;
    }
    if (!logoFile && !isDemoMode) {
      dispatch(showToastNotification({ message: 'Please upload a brand logo image.', isError: true }));
      return;
    }

    setIsSubmitting(true);

    if (isDemoMode) {
      const newB = {
        id: `demo_brand_${Date.now()}`,
        name: brandName.trim(),
        logoUrl: logoPreview || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.svg/1200px-Tesla_logo.svg.png'
      };
      setBrands(prev => [...prev, newB]);
      dispatch(showToastNotification({ message: 'Brand added successfully (Demo).', isError: false }));
      closeModal();
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', brandName.trim());
      formData.append('logo', logoFile);

      const response = await api.post('/brands', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Brand registered successfully.', isError: false }));
        loadData();
        closeModal();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error creating brand.', 
        isError: true 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (brand) => {
    const hasVehicles = vehicles.some(v => v.brand?.toLowerCase() === brand.name?.toLowerCase());
    if (hasVehicles) {
      dispatch(showToastNotification({ 
        message: `Cannot delete '${brand.name}'. It is assigned to registered fleet vehicles.`, 
        isError: true 
      }));
      return;
    }
    setConfirmModal({ show: true, brand });
  };

  const handleConfirmDelete = async () => {
    const brand = confirmModal.brand;
    if (!brand) return;

    setIsSubmitting(true);

    if (isDemoMode) {
      setBrands(prev => prev.filter(b => b.id !== brand.id));
      dispatch(showToastNotification({ message: 'Brand deleted successfully (Demo).', isError: false }));
      setConfirmModal({ show: false, brand: null });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.delete(`/brands/${brand.id}`);
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Brand deleted successfully.', isError: false }));
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error deleting brand.', 
        isError: true 
      }));
    } finally {
      setConfirmModal({ show: false, brand: null });
      setIsSubmitting(false);
    }
  };

  const totalBrandsCount = brands.length;
  const activeBrandsCount = brands.filter(b => 
    vehicles.some(v => v.brand?.toLowerCase() === b.name?.toLowerCase())
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Total Registered Brands</span>
          <h3 className="text-2xl font-black text-appTextLight">{totalBrandsCount}</h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2 font-bold">Brands In Fleet</span>
          <h3 className="text-2xl font-black text-appSecondary">{activeBrandsCount} <span className="text-xs font-semibold text-appTextGray">/ {totalBrandsCount} active</span></h3>
        </div>
      </div>

      {/* 2. Brands Grid Section */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-md font-bold">Manufacturer Brand Catalog</h2>
            <p className="text-xs text-appTextGray">View, register and manage automobile brands and logos available for vehicles registry</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-appSecondary hover:bg-appSecondary/90 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/10"
          >
            <Plus className="w-4 h-4" />
            Add Brand
          </button>
        </div>

        {/* Brands Grid */}
        <div className="p-6">
          {isLoading && brands.length === 0 ? (
            <div className="text-center py-12 text-appTextGray text-xs">
              Syncing brand registry...
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12 text-appTextGray text-xs border border-dashed border-white/5 rounded-xl">
              No registered brands found. Click "Add Brand" to register a manufacturer logo.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map(brand => {
                const count = vehicles.filter(v => v.brand?.toLowerCase() === brand.name?.toLowerCase()).length;
                return (
                  <div 
                    key={brand.id || brand.name} 
                    className="bg-black/45 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-between group hover:border-appSecondary/30 hover:bg-black/70 transition-all shadow-md relative"
                  >
                    {/* Delete button (only if not protected brand - or standard delete check) */}
                    <button
                      onClick={() => requestDelete(brand)}
                      className="absolute top-3 right-3 p-1.5 bg-red-950/20 hover:bg-red-950/80 border border-red-500/10 hover:border-red-500/40 text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title={`Delete ${brand.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Logo container */}
                    <div className="w-20 h-20 bg-appCard border border-white/5 rounded-full flex items-center justify-center p-3 mb-3 shadow-inner group-hover:border-appSecondary/10 transition-colors">
                      <img 
                        src={brand.logoUrl} 
                        alt={brand.name} 
                        className="max-h-full max-w-full object-contain filter drop-shadow-md"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=100";
                        }}
                      />
                    </div>

                    {/* Text Details */}
                    <div className="text-center w-full">
                      <h4 className="font-bold text-sm text-appTextLight truncate px-2">{brand.name}</h4>
                      <span className="text-[10px] text-appTextGray font-semibold bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/5 inline-block mt-1">
                        {count} {count === 1 ? 'vehicle' : 'vehicles'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Add Brand Modal Dialog */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title="Register New Brand"
        icon={Tags}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Brand Name *</label>
            <input
              type="text"
              placeholder="e.g. Mercedes-Benz"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
              required
            />
          </div>

          {/* Logo File Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Brand Logo Image *</label>
            
            {logoPreview ? (
              <div className="border border-white/10 bg-black rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-appCard border border-white/5 rounded-lg flex items-center justify-center p-2">
                    <img src={logoPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-appTextLight truncate">{logoFile ? logoFile.name : 'Uploaded File'}</p>
                    <p className="text-[10px] text-appTextGray font-semibold">
                      {logoFile ? `${(logoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Dynamic Image'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview('');
                  }}
                  className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 hover:border-red-500/50 text-red-400 text-xs font-bold rounded-lg transition-all"
                >
                  Change
                </button>
              </div>
            ) : (
              <label 
                htmlFor="brand-logo-file"
                className="border-2 border-dashed border-white/10 hover:border-appSecondary/40 bg-black hover:bg-white/[0.01] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
              >
                <div className="w-10 h-10 rounded-full bg-appSecondary/10 border border-appSecondary/25 flex items-center justify-center text-appSecondary">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-appTextLight">Click to upload brand logo</p>
                  <p className="text-[10px] text-appTextGray mt-0.5">Supports PNG, JPG, JPEG, WEBP or GIF (Max 5MB)</p>
                </div>
                <input 
                  type="file" 
                  id="brand-logo-file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
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
              {isSubmitting ? 'Uploading...' : 'Register Brand'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <ConfirmationModal
        show={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, brand: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Brand"
        message={`Are you sure you want to permanently delete brand "${confirmModal.brand?.name}" from the system registry? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
