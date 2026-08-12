import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Building, AlertCircle, Edit, Check } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import Button from '../../../shared/components/Button/Button';
import { showToastNotification } from '../../dashboard/dashboardSlice';

export default function CompaniesPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, company: null });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setCompanies([
        { _id: 'demo1', name: 'Uber Technologies', contactEmail: 'fleet@uber.com', contactPhone: '+1234567890', isActive: true },
        { _id: 'demo2', name: 'Lyft Inc', contactEmail: 'admin@lyft.com', contactPhone: '+1987654321', isActive: true }
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/companies');
      if (response.data && response.data.success) {
        setCompanies(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error loading companies.', 
        isError: true 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  const openModal = (company = null) => {
    if (company) {
      setEditingId(company._id);
      setFormData({
        name: company.name,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone || '',
        isActive: company.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', contactEmail: '', contactPhone: '', isActive: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', contactEmail: '', contactPhone: '', isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactEmail.trim()) {
      dispatch(showToastNotification({ message: 'Name and email are required.', isError: true }));
      return;
    }

    setIsSubmitting(true);

    if (isDemoMode) {
      dispatch(showToastNotification({ message: `Company ${editingId ? 'updated' : 'added'} successfully (Demo).`, isError: false }));
      loadData();
      closeModal();
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await api.put(`/companies/${editingId}`, formData);
      } else {
        response = await api.post('/companies', formData);
      }

      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: `Company ${editingId ? 'updated' : 'registered'} successfully.`, isError: false }));
        loadData();
        closeModal();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error saving company.', 
        isError: true 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (company) => {
    setConfirmModal({ show: true, company });
  };

  const handleConfirmDelete = async () => {
    const company = confirmModal.company;
    if (!company) return;

    setIsSubmitting(true);

    if (isDemoMode) {
      dispatch(showToastNotification({ message: 'Company deleted successfully (Demo).', isError: false }));
      setConfirmModal({ show: false, company: null });
      setIsSubmitting(false);
      loadData();
      return;
    }

    try {
      const response = await api.delete(`/companies/${company._id}`);
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Company deleted successfully.', isError: false }));
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error deleting company.', 
        isError: true 
      }));
    } finally {
      setConfirmModal({ show: false, company: null });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-md font-bold">Corporate Fleet Companies</h2>
            <p className="text-xs text-appTextGray">Manage registered corporate entities for fleet accounts</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-appSecondary hover:bg-appSecondary/90 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/10"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        {/* List */}
        <div className="p-6">
          {isLoading && companies.length === 0 ? (
            <div className="text-center py-12 text-appTextGray text-xs">Syncing companies...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-appTextGray text-xs border border-dashed border-white/5 rounded-xl">
              No companies found. Click "Add Company" to register one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-appTextGray font-semibold">
                    <th className="pb-3 px-2">Company Name</th>
                    <th className="pb-3 px-2">Contact Email</th>
                    <th className="pb-3 px-2">Phone</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2 font-bold text-appTextLight">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Building className="w-4 h-4 text-appSecondary" />
                          </div>
                          {company.name}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-appTextGray">{company.contactEmail}</td>
                      <td className="py-4 px-2 text-appTextGray">{company.contactPhone || '-'}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${company.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {company.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(company)} className="p-1.5 hover:bg-white/10 rounded-lg text-appTextGray hover:text-white transition-colors cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => requestDelete(company)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-appTextGray hover:text-red-400 transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editingId ? "Edit Company" : "Register New Company"}
        icon={Building}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Company Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Contact Email *</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Contact Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded bg-black border border-white/10 accent-appSecondary"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-appTextLight cursor-pointer">
              Active Status
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Register Company')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        show={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, company: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message={`Are you sure you want to permanently delete "${confirmModal.company?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
