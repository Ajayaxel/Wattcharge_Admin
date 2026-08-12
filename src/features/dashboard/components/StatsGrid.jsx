import React from 'react';
import { Users, Box, Layers, CheckCircle } from 'lucide-react';

export default function StatsGrid({ stats }) {
  const { users, products, categories, isLoading } = stats || { users: 0, products: 0, categories: 0, isLoading: false };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stat Item 1 */}
      <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all group shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider">Total Users</span>
          <div className="p-2 bg-appSecondary/10 rounded-lg text-appSecondary group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-appTextLight">
          {isLoading ? '...' : users}
        </h3>
        <p className="text-[10px] text-appTextGray mt-1">
          Registered accounts
        </p>
      </div>

      {/* Stat Item 2 */}
      <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all group shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider">Store Products</span>
          <div className="p-2 bg-appSecondary/10 rounded-lg text-appSecondary group-hover:scale-110 transition-transform">
            <Box className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-appTextLight">
          {isLoading ? '...' : products}
        </h3>
        <p className="text-[10px] text-appTextGray mt-1">
          Available in store
        </p>
      </div>

      {/* Stat Item 3 */}
      <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all group shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider">Vehicle Categories</span>
          <div className="p-2 bg-appSecondary/10 rounded-lg text-appSecondary group-hover:scale-110 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-appTextLight">
          {isLoading ? '...' : categories}
        </h3>
        <p className="text-[10px] text-appTextGray mt-1">
          Active categories
        </p>
      </div>

      {/* Stat Item 4 */}
      <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all group shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider">System Status</span>
          <div className="p-2 bg-appSecondary/10 rounded-lg text-appSecondary group-hover:scale-110 transition-transform">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-appSecondary">ONLINE</h3>
        <p className="text-[10px] text-appTextGray mt-1">
          API latency: ~14ms
        </p>
      </div>
    </div>
  );
}
