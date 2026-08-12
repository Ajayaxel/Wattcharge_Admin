import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  Zap, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Search,
  Bell,
  Car,
  Tags,
  Layers,
  ShoppingBag,
  Building,
  Key
} from 'lucide-react';
import { logoutAdmin } from '../features/auth/authSlice';
import { 
  clearDashboardData, 
  clearToastNotification, 
  setUserSearchQuery 
} from '../features/dashboard/dashboardSlice';
import AppRoutes from './routes';

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isDemoMode } = useSelector((state) => state.auth);
  const { toast, userSearchQuery } = useSelector((state) => state.dashboard);

  const [activeTab, setActiveTab] = useState('dashboard');

  // Automatically clear toast notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToastNotification());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    dispatch(clearDashboardData());
  };

  // If not authenticated and not in demo mode, render login path (through routes guard)
  if (!isAuthenticated && !isDemoMode) {
    return (
      <>
        <AppRoutes activeTab={activeTab} />
        {/* Global Toast Alert */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md transform animate-bounce ${
            toast.isError 
              ? 'bg-red-950/80 border-red-500/30 text-red-200' 
              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
          }`}>
            {toast.isError ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-appPrimary font-manrope flex text-appTextLight selection:bg-appSecondary selection:text-black">
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 bg-appCard border-r border-white/5 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 bg-appSecondary/10 border border-appSecondary/35 rounded-xl flex items-center justify-center shadow shadow-appSecondary/5">
              <Zap className="w-5 h-5 text-appSecondary" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider">WATTCHARGE</h2>
              <span className="text-[10px] text-appSecondary uppercase font-bold tracking-widest bg-appSecondary/10 px-1.5 py-0.5 rounded border border-appSecondary/10">Admin Panel</span>
            </div>
          </div>

          {/* Sidebar Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Users className="w-4 h-4" />
              Users List
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'vehicles'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Car className="w-4 h-4" />
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'brands'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Tags className="w-4 h-4" />
              Brands
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Layers className="w-4 h-4" />
              Categories
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Store Products
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Zap className="w-4 h-4" />
              Services
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'companies'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Building className="w-4 h-4" />
              Fleet Companies
            </button>
            <button
              onClick={() => setActiveTab('companyCodes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'companyCodes'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Key className="w-4 h-4" />
              Fleet Codes
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-appSecondary/10 border-l-2 border-appSecondary text-appSecondary rounded-r-xl'
                  : 'text-appTextGray hover:bg-white/5 hover:text-appTextLight'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-appSecondary" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-appTextLight truncate">
                {isDemoMode ? 'Demo Admin' : 'Active Session'}
              </p>
              <p className="text-[10px] text-appTextGray truncate">
                {isDemoMode ? 'simulated_admin' : 'live_database'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header bar */}
        <header className="h-16 border-b border-white/5 bg-appCard/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight md:block hidden">
              {activeTab === 'dashboard' && 'Overview Dashboard'}
              {activeTab === 'users' && 'Registered Users'}
              {activeTab === 'vehicles' && 'Manage Vehicles'}
              {activeTab === 'brands' && 'Manage Brands'}
              {activeTab === 'categories' && 'Vehicle Categories'}
              {activeTab === 'services' && 'Manage Services'}
              {activeTab === 'bookings' && 'Customer Bookings'}
              {activeTab === 'companies' && 'Corporate Fleet'}
              {activeTab === 'companyCodes' && 'Discount Codes'}
              {activeTab === 'settings' && 'Admin Settings'}
            </h1>
            <div className="md:hidden flex items-center gap-2">
              <Zap className="w-5 h-5 text-appSecondary" />
              <span className="font-extrabold text-sm tracking-wider">WATTCHARGE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input depending on tab */}
            {activeTab === 'users' && (
              <div className="relative max-w-xs md:block hidden">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-appTextGray" />
                </span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => dispatch(setUserSearchQuery(e.target.value))}
                  className="pl-9 pr-4 py-1.5 bg-black/60 border border-white/5 rounded-full text-xs text-appTextLight focus:outline-none focus:border-appSecondary transition-all w-60"
                />
              </div>
            )}

            {/* Notifications mock */}
            <button className="p-2 text-appTextGray hover:text-appTextLight rounded-full hover:bg-white/5 transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-appSecondary rounded-full" />
            </button>

            {/* Live/Demo Connection Badge */}
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              isDemoMode 
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' 
                : 'bg-appSecondary/10 border-appSecondary/20 text-appSecondary'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDemoMode ? 'bg-yellow-400' : 'bg-appSecondary'}`} />
              {isDemoMode ? 'Demo Session' : 'Live Sync'}
            </span>

            {/* Logout Mobile */}
            <button
              onClick={handleLogout}
              className="md:hidden p-2 text-red-400 hover:bg-red-950/20 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="p-6 space-y-6">
          <AppRoutes activeTab={activeTab} />
        </div>

        {/* Global Toast Alert */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md transform ${
            toast.isError 
              ? 'bg-red-950/80 border-red-500/30 text-red-200' 
              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
          }`}>
            {toast.isError ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  );
}
