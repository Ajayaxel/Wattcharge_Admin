import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Building2, Key, Users, TrendingUp, Calendar, Hash, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../core/api/axios';

function StatCard({ icon: Icon, label, value, sub, color = 'appSecondary' }) {
  return (
    <div className="bg-appCard border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-appSecondary/10 border border-appSecondary/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-appSecondary" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white">{value ?? '—'}</p>
        <p className="text-xs font-semibold text-appTextGray">{label}</p>
        {sub && <p className="text-[10px] text-appTextGray/50 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FleetDashboardPage() {
  const { user } = useSelector((s) => s.fleetAuth);
  const [company, setCompany] = useState(null);
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.fleetCompanyId) return;
      try {
        const [companyRes, codesRes] = await Promise.all([
          api.get(`/companies/${user.fleetCompanyId}`),
          api.get('/companies/codes/manage'),
        ]);
        if (companyRes.data?.success) setCompany(companyRes.data.data);
        if (codesRes.data?.success) {
          // Filter codes that belong to this fleet
          const allCodes = codesRes.data.data || [];
          setCodes(allCodes.filter(c => c.companyId?._id === user.fleetCompanyId || c.companyId === user.fleetCompanyId));
        }
      } catch (err) {
        console.error('Fleet dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const activeCodes = codes.filter(c => c.isActive).length;
  const totalUses = codes.reduce((acc, c) => acc + (c.currentUses || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-appSecondary/20 border-t-appSecondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-appSecondary/10 to-appSecondary/5 border border-appSecondary/15 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-appSecondary/15 border border-appSecondary/25 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-appSecondary" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">{company?.name || 'Your Fleet'}</h2>
          <p className="text-xs text-appTextGray">
            Welcome back, <span className="text-appSecondary font-bold">{user?.name}</span>
            {company?.fleetCode && (
              <span className="ml-2 px-2 py-0.5 bg-appSecondary/10 text-appSecondary border border-appSecondary/20 rounded-md text-[10px] font-black font-mono tracking-widest">
                #{company.fleetCode}
              </span>
            )}
          </p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-[10px] text-appTextGray uppercase tracking-wider">Fleet Status</p>
          <span className={`flex items-center gap-1 text-xs font-bold ${company?.isActive ? 'text-green-400' : 'text-red-400'}`}>
            {company?.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {company?.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Key} label="Total Codes" value={codes.length} />
        <StatCard icon={CheckCircle} label="Active Codes" value={activeCodes} />
        <StatCard icon={Users} label="Total Code Uses" value={totalUses} sub="users who applied a code" />
        <StatCard icon={TrendingUp} label="Allowed Domains" value={company?.allowedEmailDomains?.length || 0} sub="email restrictions" />
      </div>

      {/* Codes table */}
      <div className="bg-appCard border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <Key className="w-4 h-4 text-appSecondary" />
          <div>
            <h3 className="text-sm font-bold text-white">Fleet Discount Codes</h3>
            <p className="text-[10px] text-appTextGray">Codes linked to your fleet</p>
          </div>
        </div>
        <div className="p-5">
          {codes.length === 0 ? (
            <div className="text-center py-10 text-appTextGray">
              <Key className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No codes assigned to this fleet yet.</p>
              <p className="text-xs mt-1">Contact your system administrator to create codes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-appTextGray text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3 text-left">Code</th>
                    <th className="pb-3 px-3 text-left">Discount</th>
                    <th className="pb-3 px-3 text-left">Uses</th>
                    <th className="pb-3 px-3 text-left">Max Uses</th>
                    <th className="pb-3 px-3 text-left">Expires</th>
                    <th className="pb-3 px-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {codes.map((code) => (
                    <tr key={code._id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-appSecondary/10 text-appSecondary border border-appSecondary/20 rounded-lg text-[11px] font-black font-mono w-fit">
                          <Hash className="w-2.5 h-2.5" />{code.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white font-bold">{code.discountPercentage}%</td>
                      <td className="py-3 px-3 text-appTextGray">{code.currentUses}</td>
                      <td className="py-3 px-3 text-appTextGray">{code.maxUses ?? '∞'}</td>
                      <td className="py-3 px-3 text-appTextGray text-xs">
                        {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${code.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-red-500/10 text-red-400 border border-red-500/15'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${code.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                          {code.isActive ? 'ACTIVE' : 'INACTIVE'}
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

      {/* Fleet info */}
      {company && (
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-appTextGray uppercase tracking-wider font-bold mb-2">Fleet Info</p>
            <div className="space-y-2">
              {company.contactEmail && (
                <p className="text-xs text-appTextGray">📧 {company.contactEmail}</p>
              )}
              {company.contactPhone && (
                <p className="text-xs text-appTextGray">📞 {company.contactPhone}</p>
              )}
              {company.address && (
                <p className="text-xs text-appTextGray">📍 {company.address}</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-appTextGray uppercase tracking-wider font-bold mb-2">Allowed Email Domains</p>
            {company.allowedEmailDomains?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {company.allowedEmailDomains.map(d => (
                  <span key={d} className="px-2 py-0.5 bg-white/5 text-appTextGray border border-white/10 rounded-md text-[11px] font-mono">{d}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-appTextGray/50 italic">Any email domain allowed</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
