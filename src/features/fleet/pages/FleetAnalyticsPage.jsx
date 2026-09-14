import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp, Users, Key, Calendar, Activity } from 'lucide-react';
import api from '../../../core/api/axios';

export default function FleetAnalyticsPage() {
  const { user } = useSelector((s) => s.fleetAuth);
  
  const [data, setData] = useState({
    codes: [],
    members: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.fleetCompanyId) return;
      try {
        const [codesRes, membersRes] = await Promise.all([
          api.get('/companies/codes/manage'),
          api.get(`/companies/${user.fleetCompanyId}/members`),
        ]);
        
        let codes = [];
        let members = [];
        
        if (codesRes.data?.success) {
          const allCodes = codesRes.data.data || [];
          codes = allCodes.filter(c => c.companyId?._id === user.fleetCompanyId || c.companyId === user.fleetCompanyId);
        }
        if (membersRes.data?.success) {
          members = membersRes.data.data || [];
        }
        
        setData({ codes, members });
      } catch (err) {
        console.error('Failed to load analytics data:', err);
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

  const { codes, members } = data;
  
  const totalUses = codes.reduce((acc, c) => acc + (c.currentUses || 0), 0);
  const activeMembers = members.filter(m => m.isActive).length;
  
  // Calculate average discount
  const avgDiscount = codes.length 
    ? Math.round(codes.reduce((acc, c) => acc + c.discountPercentage, 0) / codes.length) 
    : 0;

  // Find most used code
  const mostUsedCode = codes.length 
    ? codes.reduce((prev, current) => (prev.currentUses > current.currentUses) ? prev : current)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-appSecondary/10 border border-appSecondary/20 rounded-xl flex items-center justify-center">
          <Activity className="w-5 h-5 text-appSecondary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Analytics</h2>
          <p className="text-xs text-appTextGray">Insights into your fleet's engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-appCard border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-appTextGray uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Total Members
          </p>
          <p className="text-2xl font-extrabold text-white">{members.length}</p>
          <p className="text-[10px] text-green-400 mt-1">{activeMembers} active accounts</p>
        </div>

        <div className="bg-appCard border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-appTextGray uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Total Code Uses
          </p>
          <p className="text-2xl font-extrabold text-white">{totalUses}</p>
          <p className="text-[10px] text-appTextGray mt-1">Across {codes.length} codes</p>
        </div>

        <div className="bg-appCard border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-appTextGray uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Avg Discount
          </p>
          <p className="text-2xl font-extrabold text-white">{avgDiscount}%</p>
          <p className="text-[10px] text-appTextGray mt-1">Average savings provided</p>
        </div>

        <div className="bg-appCard border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-appTextGray uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
            <Key className="w-3.5 h-3.5" /> Top Code
          </p>
          <p className="text-xl font-extrabold text-white font-mono">{mostUsedCode?.code || '—'}</p>
          <p className="text-[10px] text-appTextGray mt-1">{mostUsedCode ? `${mostUsedCode.currentUses} uses` : 'No usage yet'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simple visual representation for members vs codes, in lieu of chart.js */}
        <div className="bg-appCard border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-6">Code Usage Distribution</h3>
          {codes.length === 0 ? (
            <p className="text-sm text-appTextGray">No data available.</p>
          ) : (
            <div className="space-y-4">
              {codes.map(code => {
                const percent = totalUses ? Math.round((code.currentUses / totalUses) * 100) : 0;
                return (
                  <div key={code._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-white">{code.code}</span>
                      <span className="text-appTextGray">{code.currentUses} uses ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-appSecondary rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-appSecondary/10 to-transparent border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <TrendingUp className="w-12 h-12 text-appSecondary mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-2">More Analytics Coming Soon</h3>
          <p className="text-sm text-appTextGray max-w-sm">
            We are working on detailed line charts and member growth trends. Check back later for advanced insights!
          </p>
        </div>
      </div>
    </div>
  );
}
