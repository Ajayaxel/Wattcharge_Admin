import React from 'react';
import { useSelector } from 'react-redux';
import { Zap, Settings } from 'lucide-react';

export default function SettingsPage() {
  const { isDemoMode } = useSelector((state) => state.auth);

  return (
    <div className="bg-appCard border border-white/5 rounded-2xl p-6 shadow-lg space-y-6">
      <div>
        <h2 className="text-md font-bold mb-1">Admin Panel Preferences</h2>
        <p className="text-xs text-appTextGray">Manage interface configurations, cluster nodes, and developer options</p>
      </div>

      <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-appSecondary flex items-center gap-2">
            <Zap className="w-4 h-4" /> System Environment Details
          </h3>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-appTextGray">API Connection:</span>
              <span className="font-semibold text-emerald-400">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-appTextGray">Database Latency:</span>
              <span className="font-semibold text-appTextLight">12ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-appTextGray">Server Version:</span>
              <span className="font-semibold text-appTextLight">v1.0.0-lean</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-appSecondary flex items-center gap-2">
            <Settings className="w-4 h-4" /> Interface Configuration
          </h3>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-appTextGray">Realtime WebSocket Sync:</span>
              <span className="text-[10px] bg-appSecondary/10 border border-appSecondary/25 text-appSecondary px-2 py-0.5 rounded font-bold">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-appTextGray">Debug Logs:</span>
              <span className="text-[10px] bg-white/5 border border-white/10 text-appTextGray px-2 py-0.5 rounded font-bold">Disabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-appTextGray">Simulated Demo Flags:</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                isDemoMode 
                  ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400' 
                  : 'bg-white/5 border border-white/10 text-appTextGray'
              }`}>{isDemoMode ? 'Active' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
