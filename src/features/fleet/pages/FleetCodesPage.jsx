import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Key, Users, Calendar, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../../core/api/axios';

export default function FleetCodesPage() {
  const { user } = useSelector((s) => s.fleetAuth);
  const [codes, setCodes] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCode, setExpandedCode] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.fleetCompanyId) return;
      try {
        const [codesRes, membersRes] = await Promise.all([
          api.get('/companies/codes/manage'),
          api.get(`/companies/${user.fleetCompanyId}/members`),
        ]);
        if (codesRes.data?.success) {
          const allCodes = codesRes.data.data || [];
          setCodes(allCodes.filter(c => c.companyId?._id === user.fleetCompanyId || c.companyId === user.fleetCompanyId));
        }
        if (membersRes.data?.success) {
          setMembers(membersRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load codes data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-appSecondary/20 border-t-appSecondary rounded-full animate-spin" />
      </div>
    );
  }

  const getMembersByCode = (codeId) => {
    return members.filter(m => m.companyCodeId?._id === codeId || m.companyCodeId === codeId);
  };

  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-appSecondary/10 border border-appSecondary/20 rounded-xl flex items-center justify-center">
          <Key className="w-5 h-5 text-appSecondary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Fleet Discount Codes</h2>
          <p className="text-xs text-appTextGray">Manage and track usage of your fleet's codes</p>
        </div>
      </div>

      <div className="space-y-4">
        {codes.length === 0 ? (
          <div className="bg-appCard border border-white/5 rounded-2xl p-10 text-center">
            <Key className="w-10 h-10 text-appTextGray/30 mx-auto mb-3" />
            <p className="text-white font-bold">No codes available</p>
            <p className="text-xs text-appTextGray mt-1">Codes created for your fleet will appear here.</p>
          </div>
        ) : (
          codes.map((code) => {
            const codeMembers = getMembersByCode(code._id);
            const isExpanded = expandedCode === code._id;
            const progress = code.maxUses ? Math.min(100, (code.currentUses / code.maxUses) * 100) : 0;
            const daysLeft = getDaysRemaining(code.expiresAt);

            return (
              <div key={code._id} className="bg-appCard border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                <div 
                  className="p-5 cursor-pointer hover:bg-white/[0.02] flex flex-wrap items-center justify-between gap-4"
                  onClick={() => setExpandedCode(isExpanded ? null : code._id)}
                >
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-appSecondary/10 text-appSecondary border border-appSecondary/20 rounded-xl text-sm font-black font-mono">
                      <Hash className="w-3.5 h-3.5" />{code.code}
                    </span>
                    <div>
                      <span className="text-lg font-extrabold text-white">{code.discountPercentage}% OFF</span>
                      <p className="text-[10px] text-appTextGray">Discount Value</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px] max-w-sm">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-appTextGray">Usage</span>
                      <span className="text-white font-bold">{code.currentUses} / {code.maxUses || '∞'}</span>
                    </div>
                    {code.maxUses && (
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-appSecondary transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xs text-white font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-appTextGray" />
                        {daysLeft !== null ? (daysLeft === 0 ? 'Expired' : `${daysLeft} days left`) : 'No Expiry'}
                      </span>
                      <span className="text-[10px] text-appTextGray block mt-0.5">
                        {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Permanent'}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${code.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-red-500/10 text-red-400 border border-red-500/15'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${code.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                      {code.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>

                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 bg-black/20 p-5">
                    <h4 className="text-xs font-bold text-appTextGray uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Members using this code ({codeMembers.length})
                    </h4>
                    
                    {codeMembers.length === 0 ? (
                      <p className="text-sm text-appTextGray italic">No members have used this code yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {codeMembers.map(member => (
                          <div key={member._id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-appSecondary/20 text-appSecondary flex items-center justify-center font-bold text-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-white truncate">{member.name}</p>
                              <p className="text-[10px] text-appTextGray truncate">{member.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
