import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, Building2, LayoutDashboard, Key, User, LogOut, ChevronRight, Users, Activity, Settings, Send } from 'lucide-react';
import { logoutFleetAdmin } from './fleetAuthSlice';

const NAV_ITEMS = [
  { path: '/fleet/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/fleet/analytics', label: 'Analytics', icon: Activity },
  { path: '/fleet/codes', label: 'Discount Codes', icon: Key },
  { path: '/fleet/members', label: 'Fleet Members', icon: Users },
  { path: '/fleet/invite', label: 'Invite Staff', icon: Send },
  { path: '/fleet/settings', label: 'Fleet Settings', icon: Settings },
  { path: '/fleet/profile', label: 'My Profile', icon: User },
];

export default function FleetLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.fleetAuth);

  const handleLogout = () => {
    dispatch(logoutFleetAdmin());
    navigate('/fleet/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-black font-manrope flex text-white selection:bg-appSecondary selection:text-black">
      {/* Sidebar */}
      <aside className="w-60 bg-appCard border-r border-white/5 flex flex-col justify-between hidden md:flex flex-shrink-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-appSecondary/10 border border-appSecondary/25 rounded-xl flex items-center justify-center">
                <Building2 className="w-4 h-4 text-appSecondary" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold tracking-wider text-white">FLEET PORTAL</h2>
                <span className="text-[9px] text-appSecondary uppercase font-bold tracking-widest">
                  {user?.name || 'Fleet Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary'
                      : 'text-appTextGray hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Powered by */}
          <div className="px-5 pt-4">
            <div className="rounded-xl border border-appSecondary/10 bg-appSecondary/5 p-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-appSecondary" />
                <span className="text-[10px] font-bold text-appSecondary tracking-wider">WATTCHARGE</span>
              </div>
              <p className="text-[9px] text-appTextGray mt-1">Fleet Management System</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-appSecondary/10 border border-appSecondary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-appSecondary" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{user?.name}</p>
              <p className="text-[10px] text-appTextGray truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 bg-appCard/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-appSecondary md:hidden" />
            <h1 className="text-sm font-bold">
              {location.pathname === '/fleet/dashboard' && 'Fleet Overview'}
              {location.pathname === '/fleet/analytics' && 'Analytics'}
              {location.pathname === '/fleet/codes' && 'Discount Codes'}
              {location.pathname === '/fleet/members' && 'Fleet Members'}
              {location.pathname === '/fleet/invite' && 'Invite Staff'}
              {location.pathname === '/fleet/settings' && 'Fleet Settings'}
              {location.pathname === '/fleet/profile' && 'My Profile'}
            </h1>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-appSecondary/10 border-appSecondary/20 text-appSecondary">
            <span className="w-1.5 h-1.5 rounded-full bg-appSecondary animate-ping" />
            Live Sync
          </span>
        </header>

        <div className="p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
