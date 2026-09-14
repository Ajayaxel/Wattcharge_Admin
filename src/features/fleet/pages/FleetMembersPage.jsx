import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Users, Mail, Calendar, Hash, Tag, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../core/api/axios';

export default function FleetMembersPage() {
  const { user } = useSelector((s) => s.fleetAuth);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMembers = async () => {
      if (!user?.fleetCompanyId) return;
      try {
        const response = await api.get(`/companies/${user.fleetCompanyId}/members`);
        if (response.data?.success) {
          setMembers(response.data.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load fleet members');
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-appSecondary/20 border-t-appSecondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-appCard border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-appSecondary" />
            <div>
              <h3 className="text-sm font-bold text-white">Fleet Members</h3>
              <p className="text-[10px] text-appTextGray">Users who have joined your fleet</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-appSecondary/10 border border-appSecondary/20 rounded-lg">
            <span className="text-xs font-bold text-appSecondary">{members.length} Members</span>
          </div>
        </div>
        
        {error ? (
          <div className="p-5 text-center text-red-400 text-sm">{error}</div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-appTextGray">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold text-white">No members yet</p>
            <p className="text-xs mt-1">Users will appear here when they join using your fleet code.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-appTextGray text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3 px-5 pt-4">Member</th>
                  <th className="pb-3 px-5 pt-4">Contact</th>
                  <th className="pb-3 px-5 pt-4">Code Used</th>
                  <th className="pb-3 px-5 pt-4">Joined On</th>
                  <th className="pb-3 px-5 pt-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {members.map((member) => (
                  <tr key={member._id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">{member.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="font-bold text-white text-sm">{member.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs text-appTextGray flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />{member.email}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      {member.companyCodeId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-appSecondary/10 text-appSecondary border border-appSecondary/20 rounded-md text-[11px] font-bold font-mono">
                          <Hash className="w-3 h-3" />
                          {member.companyCodeId.code || 'Unknown'}
                        </span>
                      ) : (
                        <span className="text-xs text-appTextGray italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs text-appTextGray flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${member.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-red-500/10 text-red-400 border border-red-500/15'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        {member.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
