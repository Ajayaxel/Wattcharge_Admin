import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Key, AlertCircle, Edit, Copy } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import Button from '../../../shared/components/Button/Button';
import { showToastNotification } from '../../dashboard/dashboardSlice';

export default function CompanyCodesPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [codes, setCodes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, code: null });

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    companyId: '',
    discountPercentage: 0,
    maxUses: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setCompanies([
        { _id: 'demo1', name: 'Uber Technologies' },
        { _id: 'demo2', name: 'Lyft Inc' }
      ]);
      setCodes([
        { _id: 'code1', code: 'UBER20', companyId: { name: 'Uber Technologies' }, discountPercentage: 20, maxUses: null, currentUses: 50, isActive: true },
        { _id: 'code2', code: 'LYFT15', companyId: { name: 'Lyft Inc' }, discountPercentage: 15, maxUses: 100, currentUses: 99, isActive: true }
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const [codesRes, companiesRes] = await Promise.all([
        api.get('/companies/codes/manage'),
        api.get('/companies')
      ]);
      
      if (codesRes.data && codesRes.data.success) {
        setCodes(codesRes.data.data || []);
      }
      if (companiesRes.data && companiesRes.data.success) {
        setCompanies(companiesRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error loading data.', 
        isError: true 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  const openModal = (code = null) => {
    if (code) {
      setEditingId(code._id);
      setFormData({
        code: code.code,
        companyId: typeof code.companyId === 'object' ? code.companyId._id : code.companyId,
        discountPercentage: code.discountPercentage,
        maxUses: code.maxUses === null ? '' : code.maxUses,
        isActive: code.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ code: '', companyId: '', discountPercentage: 10, maxUses: '', isActive: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ code: '', companyId: '', discountPercentage: 0, maxUses: '', isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.companyId || formData.discountPercentage < 0) {
      dispatch(showToastNotification({ message: 'Please fill all required fields correctly.', isError: true }));
      return;
    }

    const payload = {
      ...formData,
      maxUses: formData.maxUses === '' ? null : Number(formData.maxUses)
    };

    setIsSubmitting(true);

    if (isDemoMode) {
      dispatch(showToastNotification({ message: `Company Code ${editingId ? 'updated' : 'added'} successfully (Demo).`, isError: false }));
      loadData();
      closeModal();
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await api.put(`/companies/codes/manage/${editingId}`, payload);
      } else {
        response = await api.post('/companies/codes/manage', payload);
      }

      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: `Company Code ${editingId ? 'updated' : 'generated'} successfully.`, isError: false }));
        loadData();
        closeModal();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error saving company code.', 
        isError: true 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (code) => {
    setConfirmModal({ show: true, code });
  };

  const handleConfirmDelete = async () => {
    const code = confirmModal.code;
    if (!code) return;

    setIsSubmitting(true);

    if (isDemoMode) {
      dispatch(showToastNotification({ message: 'Company Code deleted successfully (Demo).', isError: false }));
      setConfirmModal({ show: false, code: null });
      setIsSubmitting(false);
      loadData();
      return;
    }

    try {
      const response = await api.delete(`/companies/codes/manage/${code._id}`);
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Company Code deleted successfully.', isError: false }));
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error deleting company code.', 
        isError: true 
      }));
    } finally {
      setConfirmModal({ show: false, code: null });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-md font-bold">Fleet Discount Codes</h2>
            <p className="text-xs text-appTextGray">Generate and manage promotional discount codes for corporate fleets</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-appSecondary hover:bg-appSecondary/90 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/10"
          >
            <Plus className="w-4 h-4" />
            Generate Code
          </button>
        </div>

        {/* List */}
        <div className="p-6">
          {isLoading && codes.length === 0 ? (
            <div className="text-center py-12 text-appTextGray text-xs">Syncing codes...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12 text-appTextGray text-xs border border-dashed border-white/5 rounded-xl">
              No company codes found. Click "Generate Code" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-appTextGray font-semibold">
                    <th className="pb-3 px-2">Code</th>
                    <th className="pb-3 px-2">Company</th>
                    <th className="pb-3 px-2">Discount</th>
                    <th className="pb-3 px-2">Usage</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2 font-bold text-appTextLight">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-appSecondary/10 flex items-center justify-center">
                            <Key className="w-4 h-4 text-appSecondary" />
                          </div>
                          <span className="font-mono tracking-wider">{code.code}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-appTextGray">{code.companyId?.name || 'Unknown'}</td>
                      <td className="py-4 px-2 text-appTextLight font-bold text-green-400">{code.discountPercentage}% OFF</td>
                      <td className="py-4 px-2 text-appTextGray">
                        {code.currentUses} / {code.maxUses || '∞'}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${code.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {code.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => {navigator.clipboard.writeText(code.code); dispatch(showToastNotification({message: 'Code copied to clipboard'}))}} className="p-1.5 hover:bg-white/10 rounded-lg text-appTextGray hover:text-white transition-colors cursor-pointer">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => openModal(code)} className="p-1.5 hover:bg-white/10 rounded-lg text-appTextGray hover:text-white transition-colors cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => requestDelete(code)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-appTextGray hover:text-red-400 transition-colors cursor-pointer">
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
        title={editingId ? "Edit Company Code" : "Generate New Code"}
        icon={Key}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Company Code *</label>
            <input
              type="text"
              placeholder="e.g. WATT10"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight font-mono focus:outline-none focus:border-appSecondary transition-all uppercase"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-appTextGray block">Assign to Company *</label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
              required
            >
              <option value="">Select a company</option>
              {companies.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-appTextGray block">Discount (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-appTextGray block">Max Uses</label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-sm text-appTextLight focus:outline-none focus:border-appSecondary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCode"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded bg-black border border-white/10 accent-appSecondary"
            />
            <label htmlFor="isActiveCode" className="text-xs font-bold text-appTextLight cursor-pointer">
              Active Status
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Generate Code')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        show={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, code: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Company Code"
        message={`Are you sure you want to permanently delete code "${confirmModal.code?.code}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
