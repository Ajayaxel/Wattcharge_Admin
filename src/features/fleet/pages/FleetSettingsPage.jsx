import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Settings, Building2, MapPin, Mail, Phone, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../core/api/axios';
import Button from '../../../shared/components/Button/Button';

export default function FleetSettingsPage() {
  const { user } = useSelector((s) => s.fleetAuth);
  
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    allowedEmailDomains: []
  });
  
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.fleetCompanyId) return;
      try {
        const res = await api.get(`/companies/${user.fleetCompanyId}`);
        if (res.data?.success) {
          const c = res.data.data;
          setFormData({
            name: c.name || '',
            contactEmail: c.contactEmail || '',
            contactPhone: c.contactPhone || '',
            address: c.address || '',
            allowedEmailDomains: c.allowedEmailDomains || []
          });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to load company details' });
      } finally {
        setIsLoading(false);
      }
    };
    loadCompany();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDomain = (e) => {
    e.preventDefault();
    if (!newDomain) return;
    
    // Format domain to ensure it starts with @
    const formatted = newDomain.startsWith('@') ? newDomain : `@${newDomain}`;
    
    if (!formData.allowedEmailDomains.includes(formatted)) {
      setFormData({
        ...formData,
        allowedEmailDomains: [...formData.allowedEmailDomains, formatted]
      });
    }
    setNewDomain('');
  };

  const handleRemoveDomain = (domain) => {
    setFormData({
      ...formData,
      allowedEmailDomains: formData.allowedEmailDomains.filter(d => d !== domain)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.fleetCompanyId) return;
    
    setIsSaving(true);
    setStatus(null);

    try {
      const res = await api.put(`/companies/${user.fleetCompanyId}`, formData);
      if (res.data?.success) {
        setStatus({ type: 'success', message: 'Fleet settings updated successfully' });
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update settings' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-appSecondary/20 border-t-appSecondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-appSecondary/10 border border-appSecondary/20 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-appSecondary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Fleet Settings</h2>
          <p className="text-xs text-appTextGray">Manage company details and security</p>
        </div>
      </div>

      <div className="bg-appCard border border-white/5 rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Company Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-appTextGray/50" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:border-appSecondary/50 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-appTextGray/50" />
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:border-appSecondary/50 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-appTextGray/50" />
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:border-appSecondary/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-appTextGray/50" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:border-appSecondary/50 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Security: Allowed Email Domains</h3>
            <p className="text-xs text-appTextGray pb-2">
              Restrict which email domains can use your fleet's codes. Leave empty to allow any email.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. @company.com"
                className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:border-appSecondary/50 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain(e)}
              />
              <button
                type="button"
                onClick={handleAddDomain}
                disabled={!newDomain}
                className="px-4 py-3 bg-appSecondary/10 hover:bg-appSecondary/20 text-appSecondary border border-appSecondary/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.allowedEmailDomains.length === 0 && (
                <span className="text-xs text-appTextGray italic">No domains restricted</span>
              )}
              {formData.allowedEmailDomains.map(domain => (
                <div key={domain} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg group">
                  <span className="text-sm font-mono text-white">{domain}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDomain(domain)}
                    className="text-appTextGray hover:text-red-400 opacity-50 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
              status.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {status.message}
            </div>
          )}

          <div className="pt-2 border-t border-white/5">
            <Button type="submit" variant="primary" disabled={isSaving} className="mt-4">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
