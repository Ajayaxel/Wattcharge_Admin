import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, AlertTriangle, Building2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginFleetAdmin } from '../fleetAuthSlice';

export default function FleetLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((s) => s.fleetAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/fleet/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) dispatch(loginFleetAdmin({ email, password }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-appSecondary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-appSecondary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-appCard border border-white/5 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-appSecondary/10 border border-appSecondary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-appSecondary/5">
                <Building2 className="w-8 h-8 text-appSecondary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-appSecondary/20 border border-appSecondary/30 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-appSecondary" />
              </div>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">Fleet Portal</h1>
            <p className="text-xs text-appTextGray mt-1">Powered by <span className="text-appSecondary font-bold">WATTCHARGE</span></p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-bold text-appTextGray uppercase tracking-widest">Fleet Admin Sign In</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider">
                Email Address <span className="text-appSecondary">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-appTextGray/50 pointer-events-none" />
                <input
                  id="fleet-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fleet@company.com"
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-appTextGray/30 focus:outline-none focus:border-appSecondary/60 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider">
                Password <span className="text-appSecondary">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-appTextGray/50 pointer-events-none" />
                <input
                  id="fleet-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-appTextGray/30 focus:outline-none focus:border-appSecondary/60 focus:bg-white/[0.05] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-appTextGray/50 hover:text-appTextGray transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="fleet-signin-btn"
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-appSecondary hover:bg-appSecondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-appSecondary/20 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  Sign In to Fleet Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[10px] text-appTextGray/50 mt-6">
            This portal is for fleet administrators only.{' '}
            <a href="/" className="text-appSecondary hover:underline">Go to Admin Panel</a>
          </p>
        </div>

        {/* Bottom badge */}
        <div className="flex justify-center mt-6">
          <span className="flex items-center gap-1.5 text-[10px] text-appTextGray/40 font-semibold uppercase tracking-widest">
            <Zap className="w-3 h-3 text-appSecondary/40" />
            Wattcharge Fleet Management System
          </span>
        </div>
      </div>
    </div>
  );
}
