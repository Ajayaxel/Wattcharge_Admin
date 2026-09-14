import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Send, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../core/api/axios';
import Button from '../../../shared/components/Button/Button';

export default function FleetInvitePage() {
  const { user } = useSelector((s) => s.fleetAuth);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setStatus(null);

    try {
      const res = await api.post(`/companies/${user.fleetCompanyId}/invite`, { email });
      if (res.data?.success) {
        setStatus({ type: 'success', message: `Invite sent successfully to ${email}` });
        setEmail('');
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send invite. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-8">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-appSecondary/10 border border-appSecondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-appSecondary" />
        </div>
        <h2 className="text-xl font-bold text-white">Invite Members</h2>
        <p className="text-sm text-appTextGray">
          Send an email invitation to employees to join your fleet.
        </p>
      </div>

      <div className="bg-appCard border border-white/5 rounded-3xl p-8 shadow-xl">
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider block">
              Employee Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-appTextGray/50 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
                required
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-appTextGray/30 focus:outline-none focus:border-appSecondary/50 focus:bg-white/[0.05] transition-all"
              />
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

          <Button type="submit" variant="primary" className="w-full py-4 text-sm font-bold" disabled={isLoading || !email}>
            {isLoading ? 'Sending Invite...' : 'Send Invitation'}
          </Button>
        </form>
      </div>
      
      <p className="text-center text-xs text-appTextGray">
        The invite will include instructions and your fleet code.
      </p>
    </div>
  );
}
