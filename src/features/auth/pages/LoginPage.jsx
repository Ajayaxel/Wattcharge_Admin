import React from 'react';
import { Zap } from 'lucide-react';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-appPrimary flex items-center justify-center font-manrope px-4 relative overflow-hidden select-none">
      {/* Glow ambient design backdrops */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-appSecondary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-appSecondary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-appCard border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-appSecondary/10 border border-appSecondary/25 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-appSecondary/10">
            <Zap className="w-8 h-8 text-appSecondary animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-appTextLight tracking-wide">
            WATTCHARGE <span className="text-appSecondary text-sm font-bold ml-1 bg-appSecondary/10 px-2 py-0.5 rounded border border-appSecondary/20">ADMIN</span>
          </h1>
          <p className="text-appTextGray text-sm mt-1">Manage EV charging addresses & grid access</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
